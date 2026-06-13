// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice LOCAL(anvil) 検証用の Wrapped native (WETH 型) モック。
/// @dev native を deposit すると 1:1 で WKAIA を mint、withdraw で burn して native を返す。
///      本番 Kaia では正規 WKAIA を使うため、これは local 専用のテスト足場。
///      Koukan/KoukanVault には一切触れない（独立した ERC20）。
contract MockWKAIA is ERC20 {
    event Deposit(address indexed dst, uint256 amount);
    event Withdrawal(address indexed src, uint256 amount);

    constructor() ERC20("Mock Wrapped KAIA", "mWKAIA") {}

    /// @notice native を 1:1 で WKAIA に wrap する。
    function deposit() public payable {
        _mint(msg.sender, msg.value);
        emit Deposit(msg.sender, msg.value);
    }

    /// @notice WKAIA を burn して native を 1:1 で取り戻す（unwrap）。
    function withdraw(uint256 amount) public {
        _burn(msg.sender, amount);
        (bool ok,) = payable(msg.sender).call{value: amount}("");
        require(ok, "WKAIA: native transfer failed");
        emit Withdrawal(msg.sender, amount);
    }

    receive() external payable {
        deposit();
    }
}
