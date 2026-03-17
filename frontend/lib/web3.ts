import { ethers } from 'ethers';

// Base network configuration
export const BASE_CHAIN_ID = 8453;
export const BASE_RPC_URL = 'https://mainnet.base.org';

// Token addresses on Base
export const TOKENS = {
  ETH: '0x0000000000000000000000000000000000000000',
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
  WETH: '0x4200000000000000000000000000000000000006'
} as const;

// Uniswap Router on Base
export const UNISWAP_ROUTER = '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24';

// VerificationOracle contract ABI (essential functions)
export const VERIFICATION_ORACLE_ABI = [
  {
    "inputs": [{"type": "string", "name": "task"}, {"type": "string", "name": "delivery"}],
    "name": "requestVerification",
    "outputs": [{"type": "bytes32", "name": "requestId"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"type": "string", "name": "task"},
      {"type": "string", "name": "delivery"}, 
      {"type": "address", "name": "paymentToken"},
      {"type": "uint256", "name": "amount"}
    ],
    "name": "requestVerificationWithToken",
    "outputs": [{"type": "bytes32", "name": "requestId"}],
    "stateMutability": "nonpayable", 
    "type": "function"
  },
  {
    "inputs": [{"type": "bytes32", "name": "requestId"}],
    "name": "getVerification",
    "outputs": [
      {"type": "uint8", "name": "score"},
      {"type": "string", "name": "reasoning"},
      {"type": "bool", "name": "completed"},
      {"type": "address", "name": "paymentToken"},
      {"type": "uint256", "name": "fee"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "address", "name": "paymentToken"}],
    "name": "getRequiredFee",
    "outputs": [{"type": "uint256", "name": "fee"}],
    "stateMutability": "view", 
    "type": "function"
  }
] as const;

// ERC20 ABI for token interactions
export const ERC20_ABI = [
  {
    "inputs": [{"type": "address", "name": "spender"}, {"type": "uint256", "name": "amount"}],
    "name": "approve",
    "outputs": [{"type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"type": "address", "name": "owner"}, {"type": "address", "name": "spender"}],
    "name": "allowance", 
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "address", "name": "account"}],
    "name": "balanceOf",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"type": "uint8"}],
    "stateMutability": "view", 
    "type": "function"
  }
] as const;

export interface PaymentToken {
  address: string;
  symbol: string;
  decimals: number;
  icon: string;
}

export const SUPPORTED_TOKENS: PaymentToken[] = [
  {
    address: TOKENS.ETH,
    symbol: 'ETH',
    decimals: 18,
    icon: '⟠'
  },
  {
    address: TOKENS.USDC, 
    symbol: 'USDC',
    decimals: 6,
    icon: '💵'
  },
  {
    address: TOKENS.DAI,
    symbol: 'DAI', 
    decimals: 18,
    icon: '◈'
  }
];

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  
  async connect(): Promise<{ address: string; chainId: number }> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not detected');
    }
    
    this.provider = new ethers.BrowserProvider(window.ethereum);
    
    // Request account access
    await this.provider.send('eth_requestAccounts', []);
    
    this.signer = await this.provider.getSigner();
    const address = await this.signer.getAddress();
    const network = await this.provider.getNetwork();
    
    // Switch to Base if needed
    if (Number(network.chainId) !== BASE_CHAIN_ID) {
      await this.switchToBase();
    }
    
    return {
      address,
      chainId: Number(network.chainId)
    };
  }
  
  async switchToBase(): Promise<void> {
    if (!window.ethereum) throw new Error('MetaMask not detected');
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BASE_CHAIN_ID.toString(16)}` }]
      });
    } catch (error: any) {
      // Chain not added, add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
            chainName: 'Base',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: [BASE_RPC_URL],
            blockExplorerUrls: ['https://basescan.org/']
          }]
        });
      } else {
        throw error;
      }
    }
  }
  
  async requestVerification(
    contractAddress: string,
    task: string, 
    delivery: string,
    paymentToken: string = TOKENS.ETH,
    amount?: string
  ): Promise<{ requestId: string; txHash: string }> {
    if (!this.signer) throw new Error('Not connected');
    
    const contract = new ethers.Contract(
      contractAddress,
      VERIFICATION_ORACLE_ABI,
      this.signer
    );
    
    let tx;
    
    if (paymentToken === TOKENS.ETH) {
      // Pay with ETH
      const requiredFee = await contract.getRequiredFee(TOKENS.ETH);
      tx = await contract.requestVerification(task, delivery, {
        value: requiredFee
      });
    } else {
      // Pay with ERC20 token
      if (!amount) {
        const requiredFee = await contract.getRequiredFee(paymentToken);
        amount = requiredFee.toString();
      }
      
      // Approve token spending first
      const tokenContract = new ethers.Contract(paymentToken, ERC20_ABI, this.signer);
      const approveTx = await tokenContract.approve(contractAddress, amount);
      await approveTx.wait();
      
      // Request verification with token
      tx = await contract.requestVerificationWithToken(task, delivery, paymentToken, amount);
    }
    
    const receipt = await tx.wait();
    
    // Extract requestId from event
    const event = receipt.logs.find((log: any) => 
      log.topics[0] === ethers.id('VerificationRequested(bytes32,address,uint256,address)')
    );
    
    const requestId = event ? event.topics[1] : ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ['string', 'string', 'address', 'uint256'],
        [task, delivery, await this.signer.getAddress(), Date.now()]
      )
    );
    
    return {
      requestId,
      txHash: receipt.hash
    };
  }
  
  async getVerification(contractAddress: string, requestId: string) {
    if (!this.provider) throw new Error('Not connected');
    
    const contract = new ethers.Contract(
      contractAddress,
      VERIFICATION_ORACLE_ABI, 
      this.provider
    );
    
    const [score, reasoning, completed, paymentToken, fee] = 
      await contract.getVerification(requestId);
    
    return {
      score: Number(score),
      reasoning,
      completed,
      paymentToken,
      fee: fee.toString()
    };
  }
  
  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    if (!this.provider) throw new Error('Not connected');
    
    if (tokenAddress === TOKENS.ETH) {
      const balance = await this.provider.getBalance(userAddress);
      return ethers.formatEther(balance);
    } else {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      const balance = await contract.balanceOf(userAddress);
      const decimals = await contract.decimals();
      return ethers.formatUnits(balance, decimals);
    }
  }
  
  async getRequiredFee(contractAddress: string, tokenAddress: string): Promise<string> {
    if (!this.provider) throw new Error('Not connected');
    
    const contract = new ethers.Contract(
      contractAddress,
      VERIFICATION_ORACLE_ABI,
      this.provider
    );
    
    const fee = await contract.getRequiredFee(tokenAddress);
    const token = SUPPORTED_TOKENS.find(t => t.address === tokenAddress);
    const decimals = token ? token.decimals : 18;
    
    return ethers.formatUnits(fee, decimals);
  }
}

// Global Web3 service instance
export const web3Service = new Web3Service();

// Types for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isMetaMask?: boolean;
    };
  }
}