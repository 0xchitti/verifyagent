"use client";

import { useState, useEffect } from 'react';
import { ArrowRight, Wallet, Users, Shield, Star, ExternalLink } from 'lucide-react';
import { celoWeb3Service, CELO_SUPPORTED_TOKENS, CeloPaymentToken, UserStats, VerificationWithReputation } from '../../lib/celo';

// Mock Celo contract address - replace with actual deployed contract
const CELO_CONTRACT_ADDRESS = '0x9876543210987654321098765432109876543210';

interface CeloVerificationResult {
  requestId: string;
  txHash: string;
  verification?: VerificationWithReputation;
}

export default function CeloVerifyPage() {
  const [task, setTask] = useState('');
  const [delivery, setDelivery] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string>('');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [selectedToken, setSelectedToken] = useState<CeloPaymentToken>(CELO_SUPPORTED_TOKENS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CeloVerificationResult | null>(null);
  const [error, setError] = useState<string>('');
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchTasks, setBatchTasks] = useState<string[]>(['', '']);
  const [batchDeliveries, setBatchDeliveries] = useState<string[]>(['', '']);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const { address } = await celoWeb3Service.connect();
          setUserAddress(address);
          setIsConnected(true);
          loadUserStats(address);
        }
      }
    } catch (error) {
      console.error('Connection check failed:', error);
    }
  };

  const connectWallet = async () => {
    try {
      const { address } = await celoWeb3Service.connect();
      setUserAddress(address);
      setIsConnected(true);
      setError('');
      loadUserStats(address);
    } catch (error: any) {
      setError(error.message || 'Failed to connect wallet');
    }
  };

  const loadUserStats = async (address: string) => {
    try {
      const stats = await celoWeb3Service.getUserStats(CELO_CONTRACT_ADDRESS, address);
      setUserStats(stats);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBatchMode) {
      await handleBatchSubmit();
    } else {
      await handleSingleSubmit();
    }
  };

  const handleSingleSubmit = async () => {
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
      const { requestId, txHash } = await celoWeb3Service.requestVerification(
        CELO_CONTRACT_ADDRESS,
        task,
        delivery
      );

      setResult({ requestId, txHash });
      
      // Start polling for completion
      pollVerificationStatus(requestId);
      
      // Reload user stats
      if (userAddress) {
        loadUserStats(userAddress);
      }
    } catch (error: any) {
      console.error('Verification failed:', error);
      setError(error.message || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatchSubmit = async () => {
    const validTasks = batchTasks.filter(t => t.trim());
    const validDeliveries = batchDeliveries.filter(d => d.trim());
    
    if (validTasks.length !== validDeliveries.length || validTasks.length === 0) {
      setError('Please provide matching tasks and deliveries');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { requestIds, txHash } = await celoWeb3Service.batchRequestVerification(
        CELO_CONTRACT_ADDRESS,
        validTasks,
        validDeliveries
      );

      setResult({ requestId: requestIds[0], txHash }); // Show first for simplicity
      
      if (userAddress) {
        loadUserStats(userAddress);
      }
    } catch (error: any) {
      setError(error.message || 'Batch verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pollVerificationStatus = async (requestId: string) => {
    const poll = async () => {
      try {
        const verification = await celoWeb3Service.getVerificationWithReputation(
          CELO_CONTRACT_ADDRESS,
          requestId
        );
        
        if (verification.completed) {
          setResult(prev => prev ? { ...prev, verification } : null);
        } else {
          setTimeout(poll, 3000);
        }
      } catch (error) {
        console.error('Polling failed:', error);
        setTimeout(poll, 5000);
      }
    };
    
    setTimeout(poll, 5000);
  };

  const addBatchField = () => {
    if (batchTasks.length < 10) {
      setBatchTasks([...batchTasks, '']);
      setBatchDeliveries([...batchDeliveries, '']);
    }
  };

  const removeBatchField = (index: number) => {
    if (batchTasks.length > 1) {
      setBatchTasks(batchTasks.filter((_, i) => i !== index));
      setBatchDeliveries(batchDeliveries.filter((_, i) => i !== index));
    }
  };

  const updateBatchTask = (index: number, value: string) => {
    const newTasks = [...batchTasks];
    newTasks[index] = value;
    setBatchTasks(newTasks);
  };

  const updateBatchDelivery = (index: number, value: string) => {
    const newDeliveries = [...batchDeliveries];
    newDeliveries[index] = value;
    setBatchDeliveries(newDeliveries);
  };

  const getReputationLevel = (reputation: number) => {
    if (reputation >= 1000) return { level: 'Expert', color: 'text-purple-400', icon: '👑' };
    if (reputation >= 500) return { level: 'Trusted', color: 'text-blue-400', icon: '⭐' };
    if (reputation >= 100) return { level: 'Verified', color: 'text-green-400', icon: '✓' };
    return { level: 'Newcomer', color: 'text-gray-400', icon: '🌱' };
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 sticky top-0 z-40 bg-black/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">V</span>
              </div>
              <span className="font-semibold">VerifyAgent</span>
              <div className="px-2 py-1 bg-green-400/10 border border-green-400/20 rounded text-xs text-green-400">
                Celo + SelfProtocol
              </div>
            </a>
            
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <div className="flex items-center space-x-4">
                  {userStats && (
                    <div className="flex items-center space-x-2 px-3 py-1 bg-purple-400/10 border border-purple-400/20 rounded-lg">
                      <span className="text-lg">{getReputationLevel(userStats.currentReputation).icon}</span>
                      <span className={`text-sm ${getReputationLevel(userStats.currentReputation).color}`}>
                        {getReputationLevel(userStats.currentReputation).level}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 px-3 py-1 bg-green-400/10 border border-green-400/20 rounded-lg">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-green-400">
                      {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
                >
                  <Wallet size={16} />
                  <span>Connect to Celo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">AI Verification on Celo</h1>
          <p className="text-xl text-gray-400 mb-6">
            Reputation-based verification powered by SelfProtocol
          </p>
          
          {/* Network benefits */}
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Identity Verification</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-purple-400" />
              <span>Reputation Scoring</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Community Trust</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Verification Mode Toggle */}
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setIsBatchMode(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  !isBatchMode 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Single Verification
              </button>
              <button
                onClick={() => setIsBatchMode(true)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isBatchMode 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Batch Verification (up to 10)
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isBatchMode ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Task Description
                    </label>
                    <textarea
                      value={task}
                      onChange={(e) => setTask(e.target.value)}
                      placeholder="Describe the task that was assigned..."
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400"
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
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Batch Verification</h3>
                    <button
                      type="button"
                      onClick={addBatchField}
                      disabled={batchTasks.length >= 10}
                      className="px-3 py-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm transition-colors"
                    >
                      Add Field
                    </button>
                  </div>
                  
                  {batchTasks.map((task, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-900 rounded-lg">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Task {index + 1}
                        </label>
                        <textarea
                          value={task}
                          onChange={(e) => updateBatchTask(index, e.target.value)}
                          placeholder="Task description..."
                          rows={3}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-500 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Delivery {index + 1}
                          {batchTasks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBatchField(index)}
                              className="ml-2 text-red-400 hover:text-red-300 text-xs"
                            >
                              Remove
                            </button>
                          )}
                        </label>
                        <textarea
                          value={batchDeliveries[index]}
                          onChange={(e) => updateBatchDelivery(index, e.target.value)}
                          placeholder="Delivery/output..."
                          rows={3}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-500 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !isConnected}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-green-400 hover:from-purple-600 hover:to-green-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg transition-all duration-200 font-medium"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isBatchMode ? 'Submitting Batch...' : 'Submitting...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isBatchMode ? 'Submit Batch Verification' : 'Request Verification'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* User Stats & Payment Sidebar */}
          <div className="space-y-6">
            {/* User Statistics */}
            {userStats && (
              <div className="bg-gray-900 rounded-lg p-6 space-y-4">
                <h3 className="font-medium text-white flex items-center space-x-2">
                  <span>Your Reputation</span>
                  <span className="text-lg">{getReputationLevel(userStats.currentReputation).icon}</span>
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Score</span>
                    <span className={`font-mono ${getReputationLevel(userStats.currentReputation).color}`}>
                      {userStats.currentReputation}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Verifications</span>
                    <span className="text-white">{userStats.verificationCount}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Identity</span>
                    <div className="flex items-center space-x-1">
                      <Shield size={14} className={userStats.identityVerified ? 'text-green-400' : 'text-gray-500'} />
                      <span className={userStats.identityVerified ? 'text-green-400' : 'text-gray-400'}>
                        {userStats.identityVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>
                  
                  {userStats.feeDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fee Discount</span>
                      <span className="text-green-400">{userStats.feeDiscount}% off</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="bg-gray-900 rounded-lg p-6 space-y-4">
              <h3 className="font-medium text-white">Payment</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Base Fee</span>
                  <span className="text-white">0.1 CELO</span>
                </div>
                
                {userStats?.feeDiscount && userStats.feeDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Your Fee</span>
                    <span className="text-green-400">{userStats.suggestedFee} CELO</span>
                  </div>
                )}
                
                {isBatchMode && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Batch x{batchTasks.filter(t => t.trim()).length}</span>
                    <span className="text-purple-400">
                      {userStats ? 
                        (parseFloat(userStats.suggestedFee) * batchTasks.filter(t => t.trim()).length).toFixed(3) 
                        : (0.1 * batchTasks.filter(t => t.trim()).length).toFixed(1)
                      } CELO
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Celo Benefits */}
            <div className="bg-gray-900 rounded-lg p-6 space-y-4">
              <h3 className="font-medium text-white">Celo + SelfProtocol Benefits</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-start space-x-3">
                  <Shield size={16} className="text-green-400 mt-0.5" />
                  <div>Identity verification via SelfProtocol</div>
                </div>
                <div className="flex items-start space-x-3">
                  <Star size={16} className="text-purple-400 mt-0.5" />
                  <div>Reputation-based fee discounts</div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users size={16} className="text-blue-400 mt-0.5" />
                  <div>Community trust scoring</div>
                </div>
                <div className="flex items-start space-x-3">
                  <ArrowRight size={16} className="text-yellow-400 mt-0.5" />
                  <div>Batch verification for efficiency</div>
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
                <a 
                  href={`https://explorer.celo.org/tx/${result.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-purple-400 hover:text-purple-300"
                >
                  <span className="text-sm">View on Celo Explorer</span>
                  <ExternalLink size={14} />
                </a>
              </div>

              {result.verification?.completed && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Quality Score</div>
                    <div className="text-3xl font-bold text-green-400">
                      {result.verification.score}/100
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Reputation Impact</div>
                    <div className="text-lg text-purple-400">
                      +{Math.floor(result.verification.score / 10)} points
                    </div>
                  </div>
                  
                  {result.verification.reasoning && (
                    <div className="md:col-span-2">
                      <div className="text-sm text-gray-400 mb-2">AI Reasoning</div>
                      <div className="bg-gray-800 p-4 rounded-lg text-gray-300">
                        {result.verification.reasoning}
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