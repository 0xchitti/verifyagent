// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title VerificationOracle
 * @dev AI-powered verification oracle for agent economy
 * @notice Evaluates task completion quality and posts onchain verdicts
 */
contract VerificationOracle {
    struct VerificationRequest {
        bytes32 taskHash;
        bytes32 deliveryHash;
        address requester;
        uint256 fee;
        bool completed;
        uint8 score; // 0-100
        string reasoning;
    }
    
    mapping(bytes32 => VerificationRequest) public verifications;
    mapping(address => bool) public authorizedOracles;
    
    address public owner;
    uint256 public baseFee = 0.001 ether;
    
    event VerificationRequested(bytes32 indexed requestId, address requester, uint256 fee);
    event VerificationCompleted(bytes32 indexed requestId, uint8 score, string reasoning);
    
    constructor() {
        owner = msg.sender;
        authorizedOracles[msg.sender] = true;
    }
    
    /**
     * @dev Submit task and delivery for AI verification
     */
    function requestVerification(
        string calldata task,
        string calldata delivery
    ) external payable returns (bytes32 requestId) {
        require(msg.value >= baseFee, "Insufficient fee");
        
        requestId = keccak256(abi.encodePacked(task, delivery, msg.sender, block.timestamp));
        
        verifications[requestId] = VerificationRequest({
            taskHash: keccak256(bytes(task)),
            deliveryHash: keccak256(bytes(delivery)),
            requester: msg.sender,
            fee: msg.value,
            completed: false,
            score: 0,
            reasoning: ""
        });
        
        emit VerificationRequested(requestId, msg.sender, msg.value);
        
        return requestId;
    }
    
    /**
     * @dev Oracle posts verification result onchain
     */
    function postVerification(
        bytes32 requestId,
        uint8 score,
        string calldata reasoning
    ) external {
        require(authorizedOracles[msg.sender], "Unauthorized oracle");
        require(!verifications[requestId].completed, "Already completed");
        require(score <= 100, "Invalid score");
        
        verifications[requestId].score = score;
        verifications[requestId].reasoning = reasoning;
        verifications[requestId].completed = true;
        
        emit VerificationCompleted(requestId, score, reasoning);
    }
    
    /**
     * @dev Get verification result
     */
    function getVerification(bytes32 requestId) external view returns (
        uint8 score,
        string memory reasoning,
        bool completed
    ) {
        VerificationRequest memory req = verifications[requestId];
        return (req.score, req.reasoning, req.completed);
    }
}