// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/VerificationOracle.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address oracle = vm.addr(deployerPrivateKey);
        address feeToken = vm.envAddress("FEE_TOKEN");
        uint256 fee = vm.envUint("VERIFICATION_FEE");

        vm.startBroadcast(deployerPrivateKey);

        VerificationOracle verifier = new VerificationOracle(
            oracle,       // oracle operator
            feeToken,     // USDC/cUSD address
            fee,          // fee in token units
            oracle        // fee recipient (same as oracle for now)
        );

        console.log("VerificationOracle deployed at:", address(verifier));
        console.log("Oracle operator:", oracle);
        console.log("Fee token:", feeToken);
        console.log("Verification fee:", fee);

        vm.stopBroadcast();
    }
}
