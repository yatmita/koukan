// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {KoukanVault} from "../src/KoukanVault.sol";
import {Koukan} from "../src/Koukan.sol";
import {MockWKAIA} from "../src/MockWKAIA.sol";

contract DeployKoukan is Script {
    function run() external {
        vm.startBroadcast();

        KoukanVault impl = new KoukanVault();
        Koukan factory = new Koukan(address(impl));
        console.log("Koukan deployed at:", address(factory));
        console.log("KoukanVault impl at:", address(impl));

        uint256 mintFeeWei = vm.envOr("MINT_FEE_WEI", uint256(0));
        if (mintFeeWei > 0) {
            factory.setMintFee(mintFeeWei);
        }

        // Wrapped native (anvil 用)。本番 Kaia は WKAIA_ADDRESS で正規アドレスを渡す。
        address wkaia = vm.envOr("WKAIA_ADDRESS", address(0));
        if (wkaia == address(0)) {
            MockWKAIA mock = new MockWKAIA();
            wkaia = address(mock);
            console.log("MockWKAIA deployed at:", wkaia);
        }

        vm.stopBroadcast();
    }
}
