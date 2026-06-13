// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {Koukan} from "../src/Koukan.sol";
import {KoukanVault} from "../src/KoukanVault.sol";
import {MockJPYC} from "../src/MockJPYC.sol";

// Kaia Kairos (chainId 1001) にデプロイ済みの Koukan factory / Vault impl /
// MockWKAIA / MockJPYC に対する fork live test。OSS 公開後にクローン → fork test
// だけで「testnet 上の atomic swap が実際に成立する」ことを確認できる。
//
// Run:
//   forge test --fork-url $KAIA_KAIROS_RPC_URL --match-path test/KoukanForkLive.t.sol -vv
contract KoukanForkLiveTest is Test {
    Koukan constant KOUKAN = Koukan(0xD8fFDB190892A37fc82851B38DeA40152c7caC66);
    address constant VAULT_IMPL = 0x1c792b3396538aef0f545fBB2783c7A7a86E8B97;
    MockJPYC constant JPYC = MockJPYC(0x7a85800020d4847b9760d5F09658Ede3972e7B18);
    address constant WKAIA = 0xc0F730fcf73Df864521B615494283754005bAC95;

    address internal maker = address(0xBEEF01);
    address internal counterparty = address(0xBEEF02);

    modifier onKairosFork() {
        if (block.chainid != 1001) {
            // forge test を素で打った時（anvil 31337）は skip して通す
            vm.skip(true);
            return;
        }
        _;
    }

    function setUp() public {
        if (block.chainid != 1001) return; // setUp は skip 不可、assert を回避するだけ
        assertEq(KOUKAN.name(), "koukan");
        assertEq(KOUKAN.symbol(), "KKN");
        assertEq(KOUKAN.currentImpl(), VAULT_IMPL, "vault impl on-chain matches");
    }

    /// 民法 586 条 交換: create → maker deposit offered → counterparty fulfill → atomic swap
    function test_fullLifecycle_createDepositFulfill() public onKairosFork {
        uint256 offered = 1_000 * 1e18;       // 1000 mJPYC を offer
        uint256 wanted = 0.1 ether;            // 0.1 mWKAIA を wanted

        // 1) Koukan.create → SBT mint + Vault clone（msg.value=0、mintFee=0 想定）
        vm.prank(maker);
        (uint256 tokenId, address vaultAddr) =
            KOUKAN.create(counterparty, address(JPYC), offered, WKAIA, wanted);

        KoukanVault vault = KoukanVault(payable(vaultAddr));
        assertEq(KOUKAN.ownerOf(tokenId), maker, "SBT owned by maker");
        assertEq(vault.maker(), maker);
        assertEq(vault.counterparty(), counterparty);
        assertEq(vault.offeredAmount(), offered);
        assertEq(vault.wantedAmount(), wanted);
        assertFalse(vault.fulfilled());

        // 2) maker に JPYC を配って vault へ deposit
        vm.prank(JPYC.owner());
        JPYC.mint(maker, offered);

        vm.startPrank(maker);
        JPYC.approve(vaultAddr, offered);
        vault.deposit();
        vm.stopPrank();

        assertEq(JPYC.balanceOf(vaultAddr), offered, "vault holds offered JPYC");
        assertEq(JPYC.balanceOf(maker), 0);

        // 3) counterparty に WKAIA を配って fulfill
        //    WKAIA は MockWKAIA: native を deposit すると 1:1 で mint
        vm.deal(counterparty, wanted);
        vm.prank(counterparty);
        (bool ok,) = WKAIA.call{value: wanted}("");
        require(ok, "wkaia deposit failed");
        assertEq(IERC20Like(WKAIA).balanceOf(counterparty), wanted);

        vm.startPrank(counterparty);
        IERC20Like(WKAIA).approve(vaultAddr, wanted);
        vault.fulfill();
        vm.stopPrank();

        // 4) atomic swap 結果検証
        assertTrue(vault.fulfilled(), "fulfilled");
        assertEq(JPYC.balanceOf(counterparty), offered, "counterparty got JPYC");
        assertEq(IERC20Like(WKAIA).balanceOf(maker), wanted, "maker got WKAIA");
        assertEq(JPYC.balanceOf(vaultAddr), 0, "vault drained JPYC");
        assertEq(IERC20Like(WKAIA).balanceOf(vaultAddr), 0, "vault drained WKAIA");
        assertEq(KOUKAN.ownerOf(tokenId), maker, "SBT still soulbound to maker");

        // 5) 二重 fulfill 拒否
        vm.prank(counterparty);
        vm.expectRevert(KoukanVault.AlreadyFulfilled.selector);
        vault.fulfill();
    }

    /// maker が fulfill 前に withdraw すると offered が戻り fulfilled=true でロック
    function test_withdraw_returnsOfferedAndLocks() public onKairosFork {
        uint256 offered = 500 * 1e18;
        uint256 wanted = 0.05 ether;

        vm.prank(maker);
        (, address vaultAddr) = KOUKAN.create(counterparty, address(JPYC), offered, WKAIA, wanted);
        KoukanVault vault = KoukanVault(payable(vaultAddr));

        vm.prank(JPYC.owner());
        JPYC.mint(maker, offered);

        vm.startPrank(maker);
        JPYC.approve(vaultAddr, offered);
        vault.deposit();

        uint256 makerBalBefore = JPYC.balanceOf(maker);
        vault.withdraw();
        vm.stopPrank();

        assertTrue(vault.fulfilled(), "withdraw also locks the vault");
        assertEq(JPYC.balanceOf(maker), makerBalBefore + offered, "maker recovered offered");
        assertEq(JPYC.balanceOf(vaultAddr), 0);

        // withdraw 後の fulfill は AlreadyFulfilled
        vm.prank(counterparty);
        vm.expectRevert(KoukanVault.AlreadyFulfilled.selector);
        vault.fulfill();
    }

    /// SBT 譲渡不可 (ERC-5192)
    function test_koukan_isSoulbound() public onKairosFork {
        vm.prank(maker);
        (uint256 tokenId,) = KOUKAN.create(counterparty, address(JPYC), 1e18, WKAIA, 1e16);

        vm.prank(maker);
        vm.expectRevert(Koukan.Soulbound.selector);
        KOUKAN.transferFrom(maker, counterparty, tokenId);
    }
}

interface IERC20Like {
    function balanceOf(address) external view returns (uint256);
    function approve(address, uint256) external returns (bool);
}
