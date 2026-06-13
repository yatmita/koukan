// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {Koukan} from "../../src/Koukan.sol";
import {KoukanVault} from "../../src/KoukanVault.sol";
import {MockERC20} from "../mocks/MockERC20.sol";

/// @notice Human-owned golden test for PoC-1 (民法 586 条 交換契約).
/// Do NOT modify in ralph-loop.
contract KoukanGoldenTest is Test {
    Koukan internal factory;
    KoukanVault internal impl;
    MockERC20 internal usdc; // 6 decimals
    MockERC20 internal dai; // 18 decimals

    address internal owner = makeAddr("owner");
    address internal maker = makeAddr("maker");
    address internal counterparty = makeAddr("counterparty");
    address internal stranger = makeAddr("stranger");
    address internal feeReceiver = makeAddr("feeReceiver");

    address internal constant ETH = address(0);

    uint256 internal constant ETH_OFFER = 1 ether;
    uint256 internal constant USDC_WANT = 4000e6;
    uint256 internal constant USDC_OFFER = 4000e6;
    uint256 internal constant DAI_WANT = 4000e18;

    // ---------- Koukan events ----------
    event VaultCreated(
        uint256 indexed tokenId,
        address indexed maker,
        address indexed counterparty,
        address vault,
        address offeredToken,
        uint256 offeredAmount,
        address wantedToken,
        uint256 wantedAmount
    );
    event Locked(uint256 tokenId);
    event ImplUpdated(address indexed oldImpl, address indexed newImpl);
    event MintFeeUpdated(uint256 oldFee, uint256 newFee);

    // ---------- KoukanVault events ----------
    event Deposited(address indexed token, uint256 amount);
    event Withdrawn(address indexed token, uint256 returnedAmount);
    event Fulfilled(
        address indexed maker,
        address indexed counterparty,
        address offeredToken,
        uint256 offeredAmount,
        address wantedToken,
        uint256 wantedAmount
    );

    function setUp() public {
        usdc = new MockERC20("USDC", "USDC", 6);
        dai = new MockERC20("DAI", "DAI", 18);

        impl = new KoukanVault();

        vm.prank(owner);
        factory = new Koukan(address(impl));
    }

    // ---------- helpers ----------

    function _createETHvsUSDC() internal returns (uint256 tokenId, address vault) {
        vm.prank(maker);
        (tokenId, vault) = factory.create(counterparty, ETH, ETH_OFFER, address(usdc), USDC_WANT);
    }

    function _createUSDCvsDAI() internal returns (uint256 tokenId, address vault) {
        vm.prank(maker);
        (tokenId, vault) = factory.create(counterparty, address(usdc), USDC_OFFER, address(dai), DAI_WANT);
    }

    function _depositETH(address vault) internal {
        vm.deal(maker, ETH_OFFER);
        vm.prank(maker);
        KoukanVault(payable(vault)).deposit{value: ETH_OFFER}();
    }

    function _depositUSDC(address vault) internal {
        usdc.mint(maker, USDC_OFFER);
        vm.prank(maker);
        usdc.approve(vault, USDC_OFFER);
        vm.prank(maker);
        KoukanVault(payable(vault)).deposit();
    }

    // ============================================================
    // Factory: create
    // ============================================================

    function test_Create_ETHOffer_mintsSBTAndDeploysVault() public {
        vm.prank(maker);
        (uint256 tokenId, address vault) = factory.create(counterparty, ETH, ETH_OFFER, address(usdc), USDC_WANT);

        assertEq(tokenId, 0);
        assertEq(factory.ownerOf(tokenId), maker);
        assertEq(factory.vaults(tokenId), vault);
        assertTrue(vault != address(0));

        KoukanVault v = KoukanVault(payable(vault));
        assertEq(v.maker(), maker);
        assertEq(v.counterparty(), counterparty);
        assertEq(v.offeredToken(), ETH);
        assertEq(v.offeredAmount(), ETH_OFFER);
        assertEq(v.wantedToken(), address(usdc));
        assertEq(v.wantedAmount(), USDC_WANT);
        assertEq(v.fulfilled(), false);
    }

    function test_Create_ERC20Offer_mintsSBTAndDeploysVault() public {
        vm.prank(maker);
        (uint256 tokenId, address vault) =
            factory.create(counterparty, address(usdc), USDC_OFFER, address(dai), DAI_WANT);

        assertEq(tokenId, 0);
        KoukanVault v = KoukanVault(payable(vault));
        assertEq(v.offeredToken(), address(usdc));
        assertEq(v.wantedToken(), address(dai));
    }

    function test_Create_revertsOnZeroCounterparty() public {
        vm.prank(maker);
        vm.expectRevert();
        factory.create(address(0), ETH, ETH_OFFER, address(usdc), USDC_WANT);
    }

    function test_Create_revertsOnZeroWantedToken() public {
        vm.prank(maker);
        vm.expectRevert();
        factory.create(counterparty, ETH, ETH_OFFER, address(0), USDC_WANT);
    }

    function test_Create_revertsOnZeroOfferedAmount() public {
        vm.prank(maker);
        vm.expectRevert();
        factory.create(counterparty, ETH, 0, address(usdc), USDC_WANT);
    }

    function test_Create_revertsOnZeroWantedAmount() public {
        vm.prank(maker);
        vm.expectRevert();
        factory.create(counterparty, ETH, ETH_OFFER, address(usdc), 0);
    }

    function test_Create_revertsOnInsufficientFee() public {
        vm.prank(owner);
        factory.setMintFee(0.01 ether);

        vm.deal(maker, 0.005 ether);
        vm.prank(maker);
        vm.expectRevert();
        factory.create{value: 0.005 ether}(counterparty, ETH, ETH_OFFER, address(usdc), USDC_WANT);
    }

    function test_Create_succeedsWithExactMintFee() public {
        vm.prank(owner);
        factory.setMintFee(0.01 ether);

        vm.deal(maker, 0.01 ether);
        vm.prank(maker);
        (uint256 tokenId,) = factory.create{value: 0.01 ether}(counterparty, address(usdc), USDC_OFFER, address(dai), DAI_WANT);
        assertEq(tokenId, 0);
        assertEq(address(factory).balance, 0.01 ether);
    }

    // ============================================================
    // Factory: SBT (ERC-5192) + soulbound reverts
    // ============================================================

    function test_Locked_alwaysReturnsTrue() public {
        (uint256 tokenId,) = _createETHvsUSDC();
        assertTrue(factory.locked(tokenId));
        assertTrue(factory.locked(999)); // even non-existent ids return true (pure)
    }

    function test_TransferFrom_reverts() public {
        (uint256 tokenId,) = _createETHvsUSDC();
        vm.prank(maker);
        vm.expectRevert();
        factory.transferFrom(maker, stranger, tokenId);
    }

    function test_SafeTransferFrom_reverts() public {
        (uint256 tokenId,) = _createETHvsUSDC();
        vm.prank(maker);
        vm.expectRevert();
        factory.safeTransferFrom(maker, stranger, tokenId);
    }

    function test_Approve_reverts() public {
        (uint256 tokenId,) = _createETHvsUSDC();
        vm.prank(maker);
        vm.expectRevert();
        factory.approve(stranger, tokenId);
    }

    function test_SetApprovalForAll_reverts() public {
        _createETHvsUSDC();
        vm.prank(maker);
        vm.expectRevert();
        factory.setApprovalForAll(stranger, true);
    }

    // ============================================================
    // Factory: admin (setMintFee / setImpl / withdrawFees)
    // ============================================================

    function test_SetMintFee_onlyOwner() public {
        vm.prank(stranger);
        vm.expectRevert();
        factory.setMintFee(0.01 ether);
    }

    function test_SetMintFee_updatesAndEmits() public {
        vm.expectEmit(true, true, true, true);
        emit MintFeeUpdated(0, 0.01 ether);

        vm.prank(owner);
        factory.setMintFee(0.01 ether);
        assertEq(factory.mintFee(), 0.01 ether);
    }

    function test_SetImpl_onlyOwner() public {
        KoukanVault newImpl = new KoukanVault();
        vm.prank(stranger);
        vm.expectRevert();
        factory.setImpl(address(newImpl));
    }

    function test_SetImpl_existingVaultsUseOldImpl() public {
        // Create vault A with original impl
        (, address vaultA) = _createETHvsUSDC();

        // Deploy new impl and swap
        KoukanVault newImpl = new KoukanVault();
        vm.prank(owner);
        factory.setImpl(address(newImpl));

        // Existing vault A still works with original impl
        _depositETH(vaultA);
        assertEq(KoukanVault(payable(vaultA)).getOfferBalance(), ETH_OFFER);
    }

    function test_SetImpl_newCreateUsesNewImpl() public {
        KoukanVault newImpl = new KoukanVault();
        vm.prank(owner);
        factory.setImpl(address(newImpl));
        assertEq(factory.currentImpl(), address(newImpl));

        // New vault clones from newImpl
        vm.prank(maker);
        (, address vault) = factory.create(counterparty, ETH, ETH_OFFER, address(usdc), USDC_WANT);
        assertTrue(vault != address(0));
    }

    function test_WithdrawFees_onlyOwner() public {
        vm.prank(stranger);
        vm.expectRevert();
        factory.withdrawFees(payable(feeReceiver));
    }

    function test_WithdrawFees_sendsBalanceToReceiver() public {
        // Accumulate fees
        vm.prank(owner);
        factory.setMintFee(0.01 ether);

        vm.deal(maker, 0.01 ether);
        vm.prank(maker);
        factory.create{value: 0.01 ether}(counterparty, address(usdc), USDC_OFFER, address(dai), DAI_WANT);

        assertEq(address(factory).balance, 0.01 ether);

        vm.prank(owner);
        factory.withdrawFees(payable(feeReceiver));
        assertEq(feeReceiver.balance, 0.01 ether);
        assertEq(address(factory).balance, 0);
    }

    // ============================================================
    // Vault: deposit
    // ============================================================

    function test_Deposit_ETH_creditsBalance() public {
        (, address vault) = _createETHvsUSDC();
        vm.deal(maker, ETH_OFFER);

        vm.prank(maker);
        KoukanVault(payable(vault)).deposit{value: ETH_OFFER}();

        assertEq(vault.balance, ETH_OFFER);
        assertEq(KoukanVault(payable(vault)).getOfferBalance(), ETH_OFFER);
    }

    function test_Deposit_ERC20_creditsBalance() public {
        (, address vault) = _createUSDCvsDAI();
        usdc.mint(maker, USDC_OFFER);

        vm.prank(maker);
        usdc.approve(vault, USDC_OFFER);

        vm.prank(maker);
        KoukanVault(payable(vault)).deposit();

        assertEq(usdc.balanceOf(vault), USDC_OFFER);
        assertEq(KoukanVault(payable(vault)).getOfferBalance(), USDC_OFFER);
    }

    function test_Deposit_revertsForNonMaker() public {
        (, address vault) = _createETHvsUSDC();
        vm.deal(stranger, ETH_OFFER);
        vm.prank(stranger);
        vm.expectRevert();
        KoukanVault(payable(vault)).deposit{value: ETH_OFFER}();
    }

    function test_Deposit_revertsAfterFulfilled() public {
        // Setup: ETH<>USDC, deposit, fulfill
        (, address vault) = _createETHvsUSDC();
        _depositETH(vault);

        usdc.mint(counterparty, USDC_WANT);
        vm.prank(counterparty);
        usdc.approve(vault, USDC_WANT);
        vm.prank(counterparty);
        KoukanVault(payable(vault)).fulfill();

        // Try to deposit again
        vm.deal(maker, ETH_OFFER);
        vm.prank(maker);
        vm.expectRevert();
        KoukanVault(payable(vault)).deposit{value: ETH_OFFER}();
    }

    // ============================================================
    // Vault: withdraw
    // ============================================================

    function test_Withdraw_ETH_returnsToMakerAndMarksFulfilled() public {
        (, address vault) = _createETHvsUSDC();
        _depositETH(vault);
        uint256 makerBalBefore = maker.balance;

        vm.prank(maker);
        KoukanVault(payable(vault)).withdraw();

        assertEq(maker.balance, makerBalBefore + ETH_OFFER);
        assertEq(vault.balance, 0);
        assertTrue(KoukanVault(payable(vault)).fulfilled());
    }

    function test_Withdraw_ERC20_returnsToMakerAndMarksFulfilled() public {
        (, address vault) = _createUSDCvsDAI();
        _depositUSDC(vault);

        vm.prank(maker);
        KoukanVault(payable(vault)).withdraw();

        assertEq(usdc.balanceOf(maker), USDC_OFFER);
        assertEq(usdc.balanceOf(vault), 0);
        assertTrue(KoukanVault(payable(vault)).fulfilled());
    }

    function test_Withdraw_revertsForNonMaker() public {
        (, address vault) = _createETHvsUSDC();
        _depositETH(vault);

        vm.prank(stranger);
        vm.expectRevert();
        KoukanVault(payable(vault)).withdraw();
    }

    function test_Withdraw_thenFulfill_reverts() public {
        (, address vault) = _createETHvsUSDC();
        _depositETH(vault);

        vm.prank(maker);
        KoukanVault(payable(vault)).withdraw();

        // Now counterparty tries to fulfill
        usdc.mint(counterparty, USDC_WANT);
        vm.prank(counterparty);
        usdc.approve(vault, USDC_WANT);
        vm.prank(counterparty);
        vm.expectRevert();
        KoukanVault(payable(vault)).fulfill();
    }

    function test_Withdraw_thenDeposit_reverts() public {
        (, address vault) = _createETHvsUSDC();
        _depositETH(vault);

        vm.prank(maker);
        KoukanVault(payable(vault)).withdraw();

        // Maker tries to re-deposit
        vm.deal(maker, ETH_OFFER);
        vm.prank(maker);
        vm.expectRevert();
        KoukanVault(payable(vault)).deposit{value: ETH_OFFER}();
    }

    // ============================================================
    // Vault: fulfill
    // ============================================================

    function test_Fulfill_ETHtoERC20_atomicSwap() public {
        (, address vault) = _createETHvsUSDC();
        _depositETH(vault);

        usdc.mint(counterparty, USDC_WANT);
        vm.prank(counterparty);
        usdc.approve(vault, USDC_WANT);

        uint256 makerUsdcBefore = usdc.balanceOf(maker);
        uint256 cpEthBefore = counterparty.balance;

        vm.prank(counterparty);
        KoukanVault(payable(vault)).fulfill();

        // ETH: vault -> counterparty
        assertEq(counterparty.balance, cpEthBefore + ETH_OFFER);
        assertEq(vault.balance, 0);
        // USDC: counterparty -> maker
        assertEq(usdc.balanceOf(maker), makerUsdcBefore + USDC_WANT);
        assertEq(usdc.balanceOf(counterparty), 0);
        assertTrue(KoukanVault(payable(vault)).fulfilled());
    }

    function test_Fulfill_ERC20toERC20_atomicSwap() public {
        (, address vault) = _createUSDCvsDAI();
        _depositUSDC(vault);

        dai.mint(counterparty, DAI_WANT);
        vm.prank(counterparty);
        dai.approve(vault, DAI_WANT);

        vm.prank(counterparty);
        KoukanVault(payable(vault)).fulfill();

        // USDC: vault -> counterparty
        assertEq(usdc.balanceOf(counterparty), USDC_OFFER);
        assertEq(usdc.balanceOf(vault), 0);
        // DAI: counterparty -> maker
        assertEq(dai.balanceOf(maker), DAI_WANT);
        assertEq(dai.balanceOf(counterparty), 0);
        assertTrue(KoukanVault(payable(vault)).fulfilled());
    }

    function test_Fulfill_revertsForNonCounterparty() public {
        (, address vault) = _createETHvsUSDC();
        _depositETH(vault);

        usdc.mint(stranger, USDC_WANT);
        vm.prank(stranger);
        usdc.approve(vault, USDC_WANT);

        vm.prank(stranger);
        vm.expectRevert();
        KoukanVault(payable(vault)).fulfill();
    }

    function test_Fulfill_revertsOnInsufficientOfferBalance() public {
        // Created but never deposited
        (, address vault) = _createETHvsUSDC();

        usdc.mint(counterparty, USDC_WANT);
        vm.prank(counterparty);
        usdc.approve(vault, USDC_WANT);

        vm.prank(counterparty);
        vm.expectRevert();
        KoukanVault(payable(vault)).fulfill();
    }

    function test_Fulfill_revertsOnInsufficientAllowance() public {
        (, address vault) = _createETHvsUSDC();
        _depositETH(vault);

        // counterparty has tokens but did not approve
        usdc.mint(counterparty, USDC_WANT);

        vm.prank(counterparty);
        vm.expectRevert();
        KoukanVault(payable(vault)).fulfill();
    }

    function test_Fulfill_doubleFulfill_reverts() public {
        (, address vault) = _createETHvsUSDC();
        _depositETH(vault);

        usdc.mint(counterparty, USDC_WANT * 2);
        vm.prank(counterparty);
        usdc.approve(vault, USDC_WANT * 2);

        vm.prank(counterparty);
        KoukanVault(payable(vault)).fulfill();

        // Second fulfill should revert
        vm.prank(counterparty);
        vm.expectRevert();
        KoukanVault(payable(vault)).fulfill();
    }
}
