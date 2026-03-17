"use client";

import { useState, useEffect } from 'react';
import { ArrowRight, Wallet, ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { web3Service, SUPPORTED_TOKENS, PaymentToken, TOKENS } from '../../lib/web3';
import PaymentSelector from '../../components/PaymentSelector';

// Mock contract address - replace with actual deployed contract
const CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890';

interface VerificationResult {
  requestId: string;
  txHash: string;
  score?: number;
  reasoning?: string;
  completed: boolean;
}

export default function VerifyPage() {
  const [task, setTask] = useState('');
  const [delivery, setDelivery] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string>('');
  const [selectedToken, setSelectedToken] = useState<PaymentToken>(SUPPORTED_TOKENS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const { address } = await web3Service.connect();
          setUserAddress(address);
          setIsConnected(true);
        }
      }
    } catch (error) {
      console.error('Connection check failed:', error);
    }
  };

  const connectWallet = async () => {
    try {
      const { address } = await web3Service.connect();
      setUserAddress(address);
      setIsConnected(true);
      setError('');
    } catch (error: any) {
      setError(error.message || 'Failed to connect wallet');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim() || !delivery.trim()) {
      setError('Please fill in both task and delivery fields');
      return;
    }
    
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setResult(null);

    try {
      // Request verification through smart contract
      const { requestId, txHash } = await web3Service.requestVerification(
        CONTRACT_ADDRESS,
        task,
        delivery,
        selectedToken.address
      );

      setResult({
        requestId,
        txHash,
        completed: false
      });

      // Start polling for completion
      pollVerificationStatus(requestId);
    } catch (error: any) {
      console.error('Verification failed:', error);
      setError(error.message || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pollVerificationStatus = async (requestId: string) => {
    const poll = async () => {
      try {
        const verification = await web3Service.getVerification(CONTRACT_ADDRESS, requestId);
        if (verification.completed) {
          setResult(prev => prev ? {
            ...prev,
            score: verification.score,
            reasoning: verification.reasoning,
            completed: true
          } : null);
        } else {
          // Continue polling
          setTimeout(poll, 3000);
        }
      } catch (error) {
        console.error('Polling failed:', error);
        setTimeout(poll, 5000); // Retry in 5s
      }
    };
    
    // Start polling after 5 seconds
    setTimeout(poll, 5000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 sticky top-0 z-40 bg-black/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">V</span>
              </div>
              <span className="font-semibold">VerifyAgent</span>
            </a>
            
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-400/10 border border-green-400/20 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-400">
                    {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                  </span>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                >
                  <Wallet size={16} />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">AI Verification Oracle</h1>
          <p className="text-xl text-gray-400">
            Submit your task and delivery for AI-powered quality evaluation
          </p>
        </div>

        {/* Verification Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Task Description
                </label>
                <textarea
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="Describe the task that was assigned..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Delivery/Output
                </label>
                <textarea
                  value={delivery}
                  onChange={(e) => setDelivery(e.target.value)}
                  placeholder="Paste the completed work, output, or deliverable..."
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !isConnected || !task.trim() || !delivery.trim()}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg transition-all duration-200 font-medium"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Request Verification</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Payment Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-6">
              <PaymentSelector
                selectedToken={selectedToken}
                onTokenSelect={setSelectedToken}
                userAddress={isConnected ? userAddress : undefined}
                contractAddress={CONTRACT_ADDRESS}
              />
            </div>

            {/* Verification Info */}
            <div className="bg-gray-900 rounded-lg p-6 space-y-4">
              <h3 className="font-medium text-white">How it works</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold mt-0.5">1</div>
                  <div>Submit task description and delivery</div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold mt-0.5">2</div>
                  <div>Pay with ETH, USDC, or DAI</div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold mt-0.5">3</div>
                  <div>AI evaluates quality and posts on-chain verdict</div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold mt-0.5">4</div>
                  <div>Get score (0-100) with detailed reasoning</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-12">
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Verification Result</h3>
                <div className="flex items-center space-x-2">
                  {result.completed ? (
                    <CheckCircle size={20} className="text-green-400" />
                  ) : (
                    <Clock size={20} className="text-yellow-400 animate-pulse" />
                  )}
                  <span className={`text-sm ${result.completed ? 'text-green-400' : 'text-yellow-400'}`}>
                    {result.completed ? 'Completed' : 'Processing...'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Request ID</div>
                  <div className="font-mono text-sm bg-gray-800 p-2 rounded break-all">
                    {result.requestId}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400 mb-1">Transaction</div>
                  <a 
                    href={`https://basescan.org/tx/${result.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-400 hover:text-blue-300"
                  >
                    <span className="font-mono text-sm">{result.txHash.slice(0, 10)}...</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {result.completed && result.score !== undefined && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-400">Quality Score</div>
                    <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                      {result.score}/100 ({getScoreLabel(result.score)})
                    </div>
                  </div>
                  
                  {result.reasoning && (
                    <div>
                      <div className="text-sm text-gray-400 mb-2">AI Reasoning</div>
                      <div className="bg-gray-800 p-4 rounded-lg text-gray-300">
                        {result.reasoning}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}