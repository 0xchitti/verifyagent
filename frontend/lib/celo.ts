import { ethers } from 'ethers';

// Celo network configuration
export const CELO_CHAIN_ID = 42220;
export const CELO_RPC_URL = 'https://forno.celo.org';

// Token addresses on Celo
export const CELO_TOKENS = {
  CELO: '0x471EcE3750Da237f93B8E339c536989b8978a438',
  CUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
  CEUR: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73'
} as const;

// SelfProtocol mock interface (replace with actual SDK)
interface SelfProtocolSDK {
  verifyIdentity(address: string): Promise<boolean>;
  getReputation(address: string): Promise<number>;
  recordVerification(address: string, score: number, evidence: string): Promise<void>;
}

// VerificationOracleCelo contract ABI
export const VERIFICATION_ORACLE_CELO_ABI = [
  {
    "inputs": [{"type": "string", "name": "task"}, {"type": "string", "name": "delivery"}],
    "name": "requestVerification",
    "outputs": [{"type": "bytes32", "name": "requestId"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"type": "string[]", "name": "tasks"},
      {"type": "string[]", "name": "deliveries"}
    ],
    "name": "batchRequestVerification",
    "outputs": [{"type": "bytes32[]", "name": "requestIds"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"type": "bytes32", "name": "requestId"}],
    "name": "getVerificationWithReputation",
    "outputs": [
      {"type": "uint8", "name": "score"},
      {"type": "string", "name": "reasoning"},
      {"type": "bool", "name": "completed"},
      {"type": "bool", "name": "identityVerified"},
      {"type": "uint256", "name": "requesterReputation"},
      {"type": "uint256", "name": "fee"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "address", "name": "user"}],
    "name": "getUserStats",
    "outputs": [
      {"type": "uint256", "name": "verificationCount"},
      {"type": "uint256", "name": "currentReputation"},
      {"type": "bool", "name": "identityVerified"},
      {"type": "uint256", "name": "suggestedFee"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256", "name": "reputation"}],
    "name": "calculateAdjustedFee",
    "outputs": [{"type": "uint256", "name": "fee"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export interface CeloPaymentToken {
  address: string;
  symbol: string;
  decimals: number;
  icon: string;
}

export const CELO_SUPPORTED_TOKENS: CeloPaymentToken[] = [
  {
    address: CELO_TOKENS.CELO,
    symbol: 'CELO',
    decimals: 18,
    icon: '🌟'
  },
  {
    address: CELO_TOKENS.CUSD,
    symbol: 'cUSD',
    decimals: 18,
    icon: '💵'
  },
  {
    address: CELO_TOKENS.CEUR,
    symbol: 'cEUR',
    decimals: 18,
    icon: '🇪🇺'
  }
];

export interface UserStats {
  verificationCount: number;
  currentReputation: number;
  identityVerified: boolean;
  suggestedFee: string;
  feeDiscount: number;
}

export interface VerificationWithReputation {
  score: number;
  reasoning: string;
  completed: boolean;
  identityVerified: boolean;
  requesterReputation: number;
  fee: string;
}

export class CeloWeb3Service {
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
    
    // Switch to Celo if needed
    if (Number(network.chainId) !== CELO_CHAIN_ID) {
      await this.switchToCelo();
    }
    
    return {
      address,
      chainId: Number(network.chainId)
    };
  }
  
  async switchToCelo(): Promise<void> {
    if (!window.ethereum) throw new Error('MetaMask not detected');
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CELO_CHAIN_ID.toString(16)}` }]
      });
    } catch (error: any) {
      // Chain not added, add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${CELO_CHAIN_ID.toString(16)}`,
            chainName: 'Celo Mainnet',
            nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
            rpcUrls: [CELO_RPC_URL],
            blockExplorerUrls: ['https://explorer.celo.org/']
          }]
        });
      } else {
        throw error;
      }
    }
  }
  
  async getUserStats(contractAddress: string, userAddress: string): Promise<UserStats> {
    if (!this.provider) throw new Error('Not connected');
    
    const contract = new ethers.Contract(
      contractAddress,
      VERIFICATION_ORACLE_CELO_ABI,
      this.provider
    );
    
    const [verificationCount, currentReputation, identityVerified, suggestedFee] = 
      await contract.getUserStats(userAddress);
    
    const baseFee = ethers.parseEther('0.1'); // 0.1 CELO
    const feeDiscount = Math.round((1 - Number(suggestedFee) / Number(baseFee)) * 100);
    
    return {
      verificationCount: Number(verificationCount),
      currentReputation: Number(currentReputation),
      identityVerified,
      suggestedFee: ethers.formatEther(suggestedFee),
      feeDiscount: Math.max(0, feeDiscount)
    };
  }
  
  async requestVerification(
    contractAddress: string,
    task: string,
    delivery: string
  ): Promise<{ requestId: string; txHash: string }> {
    if (!this.signer) throw new Error('Not connected');
    
    const contract = new ethers.Contract(
      contractAddress,
      VERIFICATION_ORACLE_CELO_ABI,
      this.signer
    );
    
    // Get user stats to determine fee
    const userAddress = await this.signer.getAddress();
    const userStats = await this.getUserStats(contractAddress, userAddress);
    const fee = ethers.parseEther(userStats.suggestedFee);
    
    const tx = await contract.requestVerification(task, delivery, {
      value: fee
    });
    
    const receipt = await tx.wait();
    
    // Extract requestId from event
    const event = receipt.logs.find((log: any) => 
      log.topics[0] === ethers.id('VerificationRequested(bytes32,address,uint256,bool,uint256)')
    );
    
    const requestId = event ? event.topics[1] : ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ['string', 'string', 'address', 'uint256'],
        [task, delivery, userAddress, Date.now()]
      )
    );
    
    return {
      requestId,
      txHash: receipt.hash
    };
  }
  
  async batchRequestVerification(
    contractAddress: string,
    tasks: string[],
    deliveries: string[]
  ): Promise<{ requestIds: string[]; txHash: string }> {
    if (!this.signer) throw new Error('Not connected');
    if (tasks.length !== deliveries.length) throw new Error('Array length mismatch');
    if (tasks.length > 10) throw new Error('Too many requests (max 10)');
    
    const contract = new ethers.Contract(
      contractAddress,
      VERIFICATION_ORACLE_CELO_ABI,
      this.signer
    );
    
    // Calculate total fee
    const userAddress = await this.signer.getAddress();
    const userStats = await this.getUserStats(contractAddress, userAddress);
    const totalFee = ethers.parseEther(userStats.suggestedFee) * BigInt(tasks.length);
    
    const tx = await contract.batchRequestVerification(tasks, deliveries, {
      value: totalFee
    });
    
    const receipt = await tx.wait();
    
    // Extract requestIds from events (simplified)
    const requestIds = tasks.map((_, i) => 
      ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ['string', 'string', 'address', 'uint256', 'uint256'],
          [tasks[i], deliveries[i], userAddress, Date.now(), i]
        )
      )
    );
    
    return {
      requestIds,
      txHash: receipt.hash
    };
  }
  
  async getVerificationWithReputation(
    contractAddress: string,
    requestId: string
  ): Promise<VerificationWithReputation> {
    if (!this.provider) throw new Error('Not connected');
    
    const contract = new ethers.Contract(
      contractAddress,
      VERIFICATION_ORACLE_CELO_ABI,
      this.provider
    );
    
    const [score, reasoning, completed, identityVerified, requesterReputation, fee] = 
      await contract.getVerificationWithReputation(requestId);
    
    return {
      score: Number(score),
      reasoning,
      completed,
      identityVerified,
      requesterReputation: Number(requesterReputation),
      fee: ethers.formatEther(fee)
    };
  }
  
  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    if (!this.provider) throw new Error('Not connected');
    
    if (tokenAddress === CELO_TOKENS.CELO) {
      const balance = await this.provider.getBalance(userAddress);
      return ethers.formatEther(balance);
    } else {
      // For cUSD/cEUR (ERC20 tokens)
      const tokenAbi = [
        'function balanceOf(address) view returns (uint256)',
        'function decimals() view returns (uint8)'
      ];
      
      const contract = new ethers.Contract(tokenAddress, tokenAbi, this.provider);
      const balance = await contract.balanceOf(userAddress);
      const decimals = await contract.decimals();
      
      return ethers.formatUnits(balance, decimals);
    }
  }
}

// Mock SelfProtocol integration
export class MockSelfProtocol implements SelfProtocolSDK {
  async verifyIdentity(address: string): Promise<boolean> {
    // Mock implementation - replace with actual SelfProtocol SDK
    return Math.random() > 0.3; // 70% verified
  }
  
  async getReputation(address: string): Promise<number> {
    // Mock implementation - replace with actual SelfProtocol SDK
    return Math.floor(Math.random() * 1000);
  }
  
  async recordVerification(address: string, score: number, evidence: string): Promise<void> {
    // Mock implementation - replace with actual SelfProtocol SDK
    console.log(`Recording verification for ${address}: ${score}/100`);
  }
}

// Global Celo service instance
export const celoWeb3Service = new CeloWeb3Service();
export const selfProtocol = new MockSelfProtocol();