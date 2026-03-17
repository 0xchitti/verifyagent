// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface ISelfProtocol {
    function verifyIdentity(address user) external view returns (bool);
    function getReputation(address user) external view returns (uint256);
    function recordVerification(address user, uint8 score, string calldata evidence) external;
}

/**
 * @title VerificationOracleCelo
 * @dev AI-powered verification oracle integrated with SelfProtocol on Celo
 * @notice Leverages SelfProtocol for identity verification and reputation scoring
 */
contract VerificationOracleCelo is ReentrancyGuard {
    struct VerificationRequest {
        bytes32 taskHash;
        bytes32 deliveryHash;
        address requester;
        uint256 fee;
        bool completed;
        uint8 score; // 0-100
        string reasoning;
        uint256 timestamp;
        bool identityVerified;
        uint256 requesterReputation;
    }
    
    mapping(bytes32 => VerificationRequest) public verifications;
    mapping(address => bool) public authorizedOracles;
    mapping(address => uint256) public userVerificationCount;
    
    address public owner;
    uint256 public baseFee = 0.1 ether; // 0.1 CELO
    ISelfProtocol public selfProtocol;
    
    // Token addresses on Celo
    address public constant CELO = 0x471EcE3750Da237f93B8E339c536989b8978a438;
    address public constant CUSD = 0x765DE816845861e75A25fCA122bb6898B8B1282a;
    
    event VerificationRequested(
        bytes32 indexed requestId,
        address indexed requester,
        uint256 fee,
        bool identityVerified,
        uint256 reputation
    );
    event VerificationCompleted(
        bytes32 indexed requestId,
        uint8 score,
        string reasoning,
        uint256 reputationUpdate
    );
    event ReputationUpdated(address indexed user, uint256 oldReputation, uint256 newReputation);
    
    constructor(address _selfProtocol) {
        owner = msg.sender;
        authorizedOracles[msg.sender] = true;
        selfProtocol = ISelfProtocol(_selfProtocol);
    }
    
    /**
     * @dev Submit task and delivery for AI verification with SelfProtocol integration
     */
    function requestVerification(
        string calldata task,
        string calldata delivery
    ) external payable returns (bytes32 requestId) {
        require(msg.value >= baseFee, "Insufficient fee");
        
        // Check identity verification through SelfProtocol
        bool identityVerified = selfProtocol.verifyIdentity(msg.sender);
        uint256 reputation = selfProtocol.getReputation(msg.sender);
        
        // Apply reputation-based fee discounts
        uint256 adjustedFee = calculateAdjustedFee(reputation);
        require(msg.value >= adjustedFee, "Insufficient fee for reputation level");
        
        requestId = keccak256(
            abi.encodePacked(task, delivery, msg.sender, block.timestamp, block.difficulty)
        );
        
        verifications[requestId] = VerificationRequest({
            taskHash: keccak256(bytes(task)),
            deliveryHash: keccak256(bytes(delivery)),
            requester: msg.sender,
            fee: msg.value,
            completed: false,
            score: 0,
            reasoning: "",
            timestamp: block.timestamp,
            identityVerified: identityVerified,
            requesterReputation: reputation
        });
        
        userVerificationCount[msg.sender]++;
        
        emit VerificationRequested(requestId, msg.sender, msg.value, identityVerified, reputation);
        
        return requestId;
    }
    
    /**
     * @dev Oracle posts verification result and updates SelfProtocol reputation
     */
    function postVerification(
        bytes32 requestId,
        uint8 score,
        string calldata reasoning
    ) external {
        require(authorizedOracles[msg.sender], "Unauthorized oracle");
        require(!verifications[requestId].completed, "Already completed");
        require(score <= 100, "Invalid score");
        
        VerificationRequest storage req = verifications[requestId];
        req.score = score;
        req.reasoning = reasoning;
        req.completed = true;
        
        // Update SelfProtocol reputation based on verification score
        uint256 oldReputation = req.requesterReputation;
        uint256 reputationChange = calculateReputationChange(score, req.identityVerified);
        
        try selfProtocol.recordVerification(req.requester, score, reasoning) {
            emit ReputationUpdated(req.requester, oldReputation, oldReputation + reputationChange);
        } catch {
            // Handle SelfProtocol integration failure gracefully
        }
        
        emit VerificationCompleted(requestId, score, reasoning, reputationChange);
    }
    
    /**
     * @dev Calculate reputation-based fee adjustments
     */
    function calculateAdjustedFee(uint256 reputation) public view returns (uint256) {
        if (reputation >= 1000) {
            return baseFee * 70 / 100; // 30% discount for high reputation
        } else if (reputation >= 500) {
            return baseFee * 85 / 100; // 15% discount for medium reputation
        }
        return baseFee; // No discount for low/no reputation
    }
    
    /**
     * @dev Calculate reputation change based on verification score
     */
    function calculateReputationChange(uint8 score, bool identityVerified) public pure returns (uint256) {
        uint256 baseChange = score / 10; // 0-10 points
        
        // Bonus for identity-verified users
        if (identityVerified) {
            baseChange = baseChange * 150 / 100; // 50% bonus
        }
        
        return baseChange;
    }
    
    /**
     * @dev Get verification result with reputation context
     */
    function getVerificationWithReputation(bytes32 requestId) external view returns (
        uint8 score,
        string memory reasoning,
        bool completed,
        bool identityVerified,
        uint256 requesterReputation,
        uint256 fee
    ) {
        VerificationRequest memory req = verifications[requestId];
        return (
            req.score,
            req.reasoning,
            req.completed,
            req.identityVerified,
            req.requesterReputation,
            req.fee
        );
    }
    
    /**
     * @dev Get user's verification statistics
     */
    function getUserStats(address user) external view returns (
        uint256 verificationCount,
        uint256 currentReputation,
        bool identityVerified,
        uint256 suggestedFee
    ) {
        uint256 reputation = selfProtocol.getReputation(user);
        return (
            userVerificationCount[user],
            reputation,
            selfProtocol.verifyIdentity(user),
            calculateAdjustedFee(reputation)
        );
    }
    
    /**
     * @dev Batch verification for efficiency
     */
    function batchRequestVerification(
        string[] calldata tasks,
        string[] calldata deliveries
    ) external payable returns (bytes32[] memory requestIds) {
        require(tasks.length == deliveries.length, "Array length mismatch");
        require(tasks.length <= 10, "Too many requests");
        
        uint256 reputation = selfProtocol.getReputation(msg.sender);
        uint256 adjustedFee = calculateAdjustedFee(reputation);
        uint256 totalRequired = adjustedFee * tasks.length;
        require(msg.value >= totalRequired, "Insufficient total fee");
        
        requestIds = new bytes32[](tasks.length);
        
        for (uint256 i = 0; i < tasks.length; i++) {
            requestIds[i] = keccak256(
                abi.encodePacked(tasks[i], deliveries[i], msg.sender, block.timestamp, i)
            );
            
            verifications[requestIds[i]] = VerificationRequest({
                taskHash: keccak256(bytes(tasks[i])),
                deliveryHash: keccak256(bytes(deliveries[i])),
                requester: msg.sender,
                fee: adjustedFee,
                completed: false,
                score: 0,
                reasoning: "",
                timestamp: block.timestamp,
                identityVerified: selfProtocol.verifyIdentity(msg.sender),
                requesterReputation: reputation
            });
            
            emit VerificationRequested(
                requestIds[i],
                msg.sender,
                adjustedFee,
                selfProtocol.verifyIdentity(msg.sender),
                reputation
            );
        }
        
        userVerificationCount[msg.sender] += tasks.length;
        
        return requestIds;
    }
    
    /**
     * @dev Admin functions
     */
    function addOracle(address oracle) external {
        require(msg.sender == owner, "Only owner");
        authorizedOracles[oracle] = true;
    }
    
    function setBaseFee(uint256 newFee) external {
        require(msg.sender == owner, "Only owner");
        baseFee = newFee;
    }
    
    function setSelfProtocol(address _selfProtocol) external {
        require(msg.sender == owner, "Only owner");
        selfProtocol = ISelfProtocol(_selfProtocol);
    }
    
    function withdraw() external {
        require(msg.sender == owner, "Only owner");
        payable(owner).transfer(address(this).balance);
    }
    
    // Receive CELO
    receive() external payable {}
}