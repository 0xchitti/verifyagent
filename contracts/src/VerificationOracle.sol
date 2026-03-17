// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IUniswapV2Router {
    function swapExactTokensForETH(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function getAmountsOut(uint amountIn, address[] calldata path)
        external view returns (uint[] memory amounts);
    
    function WETH() external pure returns (address);
}

/**
 * @title VerificationOracle
 * @dev AI-powered verification oracle for agent economy with Uniswap integration
 * @notice Evaluates task completion quality and posts onchain verdicts
 * Supports payments in ETH, USDC, DAI with automatic swapping
 */
contract VerificationOracle is ReentrancyGuard {
    struct VerificationRequest {
        bytes32 taskHash;
        bytes32 deliveryHash;
        address requester;
        uint256 fee;
        address paymentToken; // ETH = address(0), otherwise ERC20
        bool completed;
        uint8 score; // 0-100
        string reasoning;
    }
    
    mapping(bytes32 => VerificationRequest) public verifications;
    mapping(address => bool) public authorizedOracles;
    mapping(address => bool) public supportedTokens;
    
    address public owner;
    uint256 public baseFeeUSD = 10; // $0.10 in cents
    
    // Uniswap V2 Router on Base
    IUniswapV2Router public constant UNISWAP_ROUTER = 
        IUniswapV2Router(0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24);
    
    // Token addresses on Base
    address public constant USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address public constant DAI = 0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb;
    address public constant WETH = 0x4200000000000000000000000000000000000006;
    
    event VerificationRequested(
        bytes32 indexed requestId, 
        address requester, 
        uint256 fee, 
        address paymentToken
    );
    event VerificationCompleted(bytes32 indexed requestId, uint8 score, string reasoning);
    event TokenSwapped(address indexed token, uint256 amountIn, uint256 amountOut);
    
    constructor() {
        owner = msg.sender;
        authorizedOracles[msg.sender] = true;
        
        // Enable supported tokens
        supportedTokens[address(0)] = true; // ETH
        supportedTokens[USDC] = true;
        supportedTokens[DAI] = true;
    }
    
    /**
     * @dev Submit task and delivery for AI verification with ETH payment
     */
    function requestVerification(
        string calldata task,
        string calldata delivery
    ) external payable returns (bytes32 requestId) {
        uint256 requiredFeeETH = getRequiredFee(address(0));
        require(msg.value >= requiredFeeETH, "Insufficient ETH fee");
        
        return _createVerificationRequest(task, delivery, msg.value, address(0));
    }
    
    /**
     * @dev Submit task and delivery for AI verification with ERC20 payment
     */
    function requestVerificationWithToken(
        string calldata task,
        string calldata delivery,
        address paymentToken,
        uint256 amount
    ) external nonReentrant returns (bytes32 requestId) {
        require(supportedTokens[paymentToken], "Unsupported token");
        require(paymentToken != address(0), "Use requestVerification for ETH");
        
        uint256 requiredFee = getRequiredFee(paymentToken);
        require(amount >= requiredFee, "Insufficient token amount");
        
        // Transfer tokens from user
        IERC20(paymentToken).transferFrom(msg.sender, address(this), amount);
        
        // Swap to ETH for gas costs
        if (paymentToken != address(0)) {
            _swapTokensForETH(paymentToken, amount);
        }
        
        return _createVerificationRequest(task, delivery, amount, paymentToken);
    }
    
    /**
     * @dev Internal function to create verification request
     */
    function _createVerificationRequest(
        string calldata task,
        string calldata delivery,
        uint256 fee,
        address paymentToken
    ) internal returns (bytes32 requestId) {
        requestId = keccak256(
            abi.encodePacked(task, delivery, msg.sender, block.timestamp, block.difficulty)
        );
        
        verifications[requestId] = VerificationRequest({
            taskHash: keccak256(bytes(task)),
            deliveryHash: keccak256(bytes(delivery)),
            requester: msg.sender,
            fee: fee,
            paymentToken: paymentToken,
            completed: false,
            score: 0,
            reasoning: ""
        });
        
        emit VerificationRequested(requestId, msg.sender, fee, paymentToken);
        
        return requestId;
    }
    
    /**
     * @dev Swap ERC20 tokens for ETH using Uniswap
     */
    function _swapTokensForETH(address token, uint256 amount) internal {
        require(token != address(0), "Cannot swap ETH");
        
        address[] memory path = new address[](2);
        path[0] = token;
        path[1] = WETH;
        
        IERC20(token).approve(address(UNISWAP_ROUTER), amount);
        
        uint256[] memory amounts = UNISWAP_ROUTER.swapExactTokensForETH(
            amount,
            0, // Accept any amount of ETH
            path,
            address(this),
            block.timestamp + 300
        );
        
        emit TokenSwapped(token, amount, amounts[1]);
    }
    
    /**
     * @dev Get required fee for payment token
     */
    function getRequiredFee(address paymentToken) public view returns (uint256) {
        if (paymentToken == address(0)) {
            // ETH: $0.10 worth (assuming 1 ETH = $3000)
            return 0.000033 ether; // ~$0.10
        } else if (paymentToken == USDC) {
            return 100000; // 0.10 USDC (6 decimals)
        } else if (paymentToken == DAI) {
            return 100000000000000000; // 0.10 DAI (18 decimals)
        }
        
        revert("Unsupported payment token");
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
        bool completed,
        address paymentToken,
        uint256 fee
    ) {
        VerificationRequest memory req = verifications[requestId];
        return (req.score, req.reasoning, req.completed, req.paymentToken, req.fee);
    }
    
    /**
     * @dev Admin functions
     */
    function addOracle(address oracle) external {
        require(msg.sender == owner, "Only owner");
        authorizedOracles[oracle] = true;
    }
    
    function addSupportedToken(address token) external {
        require(msg.sender == owner, "Only owner");
        supportedTokens[token] = true;
    }
    
    function setBaseFeeUSD(uint256 newFeeInCents) external {
        require(msg.sender == owner, "Only owner");
        baseFeeUSD = newFeeInCents;
    }
    
    function withdraw() external {
        require(msg.sender == owner, "Only owner");
        payable(owner).transfer(address(this).balance);
    }
    
    function withdrawToken(address token) external {
        require(msg.sender == owner, "Only owner");
        IERC20(token).transfer(owner, IERC20(token).balanceOf(address(this)));
    }
    
    // Receive ETH from swaps
    receive() external payable {}
}