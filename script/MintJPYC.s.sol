// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {MockJPYC} from "../src/MockJPYC.sol";

// 使い方:
//   MOCK_JPYC=0x... TO=0x... AMOUNT=100000 forge script script/MintJPYC.s.sol --rpc-url http://localhost:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
// AMOUNT は人間が読む値 (例: 100000 → 100,000 JPYC = 100_000 * 1e18 wei)
contract MintJPYC is Script {
    function run() external {
        address mockAddr = vm.envAddress("MOCK_JPYC");
        address to = vm.envAddress("TO");
        uint256 amount = vm.envUint("AMOUNT");

        vm.startBroadcast();
        MockJPYC(mockAddr).mint(to, amount * 1e18);
        vm.stopBroadcast();

        console.log("Minted to:", to);
        console.log("Amount (JPYC):", amount);
    }
}
