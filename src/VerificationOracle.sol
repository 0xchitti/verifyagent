// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title VerificationOracle - AI-powered quality verification for agent economy
/// @notice Agents submit task+delivery pairs. Oracle evaluates and posts onchain verdicts.
/// @dev Deployed on Celo. Integrates with escrow protocols as arbiter.
contract VerificationOracle is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum Verdict { Pending, Pass, Fail, Partial }

    struct VerificationRequest {
        address requester;      // Who requested verification
        string taskHash;        // IPFS hash or hash of task description
        string deliveryHash;    // IPFS hash or hash of delivery
        Verdict verdict;
        uint8 qualityScore;     // 0-100
        string reasoning;       // Oracle's reasoning
        uint256 fee;            // Fee paid for this verification
        uint256 createdAt;
        uint256 resolvedAt;
    }

    uint256 public requestCount;
    uint256 public verificationFee; // in token units
    address public feeToken;        // USDC/cUSD address
    address public oracle;          // Oracle operator (the AI agent)
    address public feeRecipient;
    bool public oracleVerified;     // SelfProtocol verified

    mapping(uint256 => VerificationRequest) public requests;
    mapping(address => uint256[]) public requesterHistory;

    // Stats
    uint256 public totalVerifications;
    uint256 public totalPassed;
    uint256 public totalFailed;
    uint256 public totalFeesCollected;

    // Events
    event VerificationRequested(
        uint256 indexed requestId,
        address indexed requester,
        string taskHash,
        string deliveryHash
    );
    event VerdictIssued(
        uint256 indexed requestId,
        Verdict verdict,
        uint8 qualityScore,
        string reasoning
    );
    event OracleVerified(address indexed oracle);
    event FeeUpdated(uint256 newFee);

    modifier onlyOracle() {
        require(msg.sender == oracle, "Not oracle");
        _;
    }

    constructor(
        address _oracle,
        address _feeToken,
        uint256 _verificationFee,
        address _feeRecipient
    ) {
        oracle = _oracle;
        feeToken = _feeToken;
        verificationFee = _verificationFee;
        feeRecipient = _feeRecipient;
    }

    /// @notice Request verification of a task delivery
    /// @param taskHash Hash/IPFS CID of the task description
    /// @param deliveryHash Hash/IPFS CID of the delivery
    /// @return requestId The ID of the verification request
    function requestVerification(
        string calldata taskHash,
        string calldata deliveryHash
    ) external nonReentrant returns (uint256) {
        require(bytes(taskHash).length > 0, "Empty task hash");
        require(bytes(deliveryHash).length > 0, "Empty delivery hash");

        // Collect fee
        IERC20(feeToken).safeTransferFrom(msg.sender, address(this), verificationFee);

        uint256 requestId = requestCount++;
        requests[requestId] = VerificationRequest({
            requester: msg.sender,
            taskHash: taskHash,
            deliveryHash: deliveryHash,
            verdict: Verdict.Pending,
            qualityScore: 0,
            reasoning: "",
            fee: verificationFee,
            createdAt: block.timestamp,
            resolvedAt: 0
        });

        requesterHistory[msg.sender].push(requestId);

        emit VerificationRequested(requestId, msg.sender, taskHash, deliveryHash);
        return requestId;
    }

    /// @notice Oracle submits verdict for a verification request
    /// @param requestId The request to resolve
    /// @param verdict Pass, Fail, or Partial
    /// @param qualityScore 0-100 quality rating
    /// @param reasoning Explanation of the verdict
    function submitVerdict(
        uint256 requestId,
        Verdict verdict,
        uint8 qualityScore,
        string calldata reasoning
    ) external onlyOracle nonReentrant {
        VerificationRequest storage req = requests[requestId];
        require(req.verdict == Verdict.Pending, "Already resolved");
        require(verdict != Verdict.Pending, "Invalid verdict");
        require(qualityScore <= 100, "Score must be 0-100");

        req.verdict = verdict;
        req.qualityScore = qualityScore;
        req.reasoning = reasoning;
        req.resolvedAt = block.timestamp;

        totalVerifications++;
        if (verdict == Verdict.Pass) totalPassed++;
        if (verdict == Verdict.Fail) totalFailed++;

        // Transfer fee to recipient
        IERC20(feeToken).safeTransfer(feeRecipient, req.fee);
        totalFeesCollected += req.fee;

        emit VerdictIssued(requestId, verdict, qualityScore, reasoning);
    }

    /// @notice Get verdict for a request (callable by escrow contracts)
    /// @return verdict The verdict enum value
    /// @return qualityScore 0-100 score
    /// @return resolved Whether the request has been resolved
    function getVerdict(uint256 requestId) external view returns (
        Verdict verdict,
        uint8 qualityScore,
        bool resolved
    ) {
        VerificationRequest storage req = requests[requestId];
        return (req.verdict, req.qualityScore, req.resolvedAt > 0);
    }

    /// @notice Get full request details
    function getRequest(uint256 requestId) external view returns (VerificationRequest memory) {
        return requests[requestId];
    }

    /// @notice Get requester's verification history
    function getRequesterHistory(address requester) external view returns (uint256[] memory) {
        return requesterHistory[requester];
    }

    /// @notice Mark oracle as SelfProtocol verified
    function markOracleVerified() external onlyOracle {
        oracleVerified = true;
        emit OracleVerified(oracle);
    }

    /// @notice Update verification fee
    function setFee(uint256 newFee) external onlyOracle {
        verificationFee = newFee;
        emit FeeUpdated(newFee);
    }

    /// @notice Get oracle stats
    function getStats() external view returns (
        uint256 _totalVerifications,
        uint256 _totalPassed,
        uint256 _totalFailed,
        uint256 _totalFeesCollected,
        bool _oracleVerified
    ) {
        return (totalVerifications, totalPassed, totalFailed, totalFeesCollected, oracleVerified);
    }
}
