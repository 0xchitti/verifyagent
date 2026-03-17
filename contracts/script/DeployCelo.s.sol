// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/VerificationOracleCelo.sol";

contract DeployCelo is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Mock SelfProtocol address (replace with actual)
        address mockSelfProtocol = 0x1234567890123456789012345678901234567890;

        // Deploy VerificationOracleCelo
        VerificationOracleCelo oracle = new VerificationOracleCelo(mockSelfProtocol);
        
        console.log("VerificationOracleCelo deployed to Celo:", address(oracle));
        console.log("Owner:", oracle.owner());
        console.log("Base fee:", oracle.baseFee(), "CELO");
        console.log("SelfProtocol:", address(oracle.selfProtocol()));

        vm.stopBroadcast();
    }
}