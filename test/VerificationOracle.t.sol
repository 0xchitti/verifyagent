// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/VerificationOracle.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {
        _mint(msg.sender, 1_000_000 * 10**6);
    }
    function decimals() public pure override returns (uint8) { return 6; }
}

contract VerificationOracleTest is Test {
    VerificationOracle public oracle;
    MockUSDC public usdc;
    address oracleOperator = address(0x1);
    address requester = address(0x2);
    address feeRecipient = address(0x3);
    uint256 fee = 50_000; // $0.05 USDC

    function setUp() public {
        usdc = new MockUSDC();
        oracle = new VerificationOracle(oracleOperator, address(usdc), fee, feeRecipient);
        usdc.transfer(requester, 10_000 * 10**6);
    }

    function testRequestVerification() public {
        vm.startPrank(requester);
        usdc.approve(address(oracle), type(uint256).max);
        uint256 reqId = oracle.requestVerification("QmTaskHash123", "QmDeliveryHash456");
        vm.stopPrank();

        VerificationOracle.VerificationRequest memory req = oracle.getRequest(reqId);
        assertEq(req.requester, requester);
        assertEq(uint(req.verdict), uint(VerificationOracle.Verdict.Pending));
        assertEq(req.fee, fee);
    }

    function testFullVerificationFlow() public {
        // Request verification
        vm.startPrank(requester);
        usdc.approve(address(oracle), type(uint256).max);
        uint256 reqId = oracle.requestVerification("QmTask", "QmDelivery");
        vm.stopPrank();

        // Oracle submits verdict
        vm.prank(oracleOperator);
        oracle.submitVerdict(reqId, VerificationOracle.Verdict.Pass, 85, "Delivery matches task requirements. Good quality.");

        // Check verdict
        (VerificationOracle.Verdict v, uint8 score, bool resolved) = oracle.getVerdict(reqId);
        assertEq(uint(v), uint(VerificationOracle.Verdict.Pass));
        assertEq(score, 85);
        assertTrue(resolved);

        // Fee went to recipient
        assertEq(usdc.balanceOf(feeRecipient), fee);

        // Stats updated
        (uint256 total, uint256 passed, uint256 failed,,) = oracle.getStats();
        assertEq(total, 1);
        assertEq(passed, 1);
        assertEq(failed, 0);
    }

    function testVerdictFail() public {
        vm.startPrank(requester);
        usdc.approve(address(oracle), type(uint256).max);
        uint256 reqId = oracle.requestVerification("QmTask", "QmBadDelivery");
        vm.stopPrank();

        vm.prank(oracleOperator);
        oracle.submitVerdict(reqId, VerificationOracle.Verdict.Fail, 15, "Delivery does not match requirements.");

        (VerificationOracle.Verdict v, uint8 score,) = oracle.getVerdict(reqId);
        assertEq(uint(v), uint(VerificationOracle.Verdict.Fail));
        assertEq(score, 15);
    }

    function testOnlyOracleCanVerdict() public {
        vm.startPrank(requester);
        usdc.approve(address(oracle), type(uint256).max);
        uint256 reqId = oracle.requestVerification("QmTask", "QmDelivery");
        vm.stopPrank();

        // Non-oracle tries to submit verdict
        vm.prank(requester);
        vm.expectRevert("Not oracle");
        oracle.submitVerdict(reqId, VerificationOracle.Verdict.Pass, 90, "Fake verdict");
    }

    function testCannotResolvetwice() public {
        vm.startPrank(requester);
        usdc.approve(address(oracle), type(uint256).max);
        uint256 reqId = oracle.requestVerification("QmTask", "QmDelivery");
        vm.stopPrank();

        vm.prank(oracleOperator);
        oracle.submitVerdict(reqId, VerificationOracle.Verdict.Pass, 90, "Good");

        vm.prank(oracleOperator);
        vm.expectRevert("Already resolved");
        oracle.submitVerdict(reqId, VerificationOracle.Verdict.Fail, 10, "Changed mind");
    }

    function testRequesterHistory() public {
        vm.startPrank(requester);
        usdc.approve(address(oracle), type(uint256).max);
        oracle.requestVerification("QmTask1", "QmDelivery1");
        oracle.requestVerification("QmTask2", "QmDelivery2");
        oracle.requestVerification("QmTask3", "QmDelivery3");
        vm.stopPrank();

        uint256[] memory history = oracle.getRequesterHistory(requester);
        assertEq(history.length, 3);
    }
}
