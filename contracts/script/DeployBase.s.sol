// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/VerificationOracle.sol";

contract DeployBase is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy VerificationOracle for Base
        VerificationOracle oracle = new VerificationOracle();
        
        console.log("VerificationOracle deployed to Base:", address(oracle));
        console.log("Owner:", oracle.owner());
        console.log("Base fee:", oracle.baseFeeUSD(), "cents");

        vm.stopBroadcast();
    }
}