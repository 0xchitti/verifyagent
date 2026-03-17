"use client";

import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Wallet, ExternalLink, CheckCircle, Clock, ChevronDown } from 'lucide-react';
import { web3Service, SUPPORTED_TOKENS, PaymentToken, TOKENS } from '../../lib/web3';
import { celoWeb3Service, CELO_SUPPORTED_TOKENS, CeloPaymentToken, UserStats } from '../../lib/celo';

// Mock contract addresses
const BASE_CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890';
const CELO_CONTRACT_ADDRESS = '0x9876543210987654321098765432109876543210';

interface VerificationResult {
  requestId: string;
  txHash: string;
  score?: number;
  reasoning?: string;
  completed: boolean;
}

export default function UnifiedVerifyPage() {
  // Animation canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [renderTime, setRenderTime] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [verificationsCount, setVerificationsCount] = useState(247);

  // Network state
  const [selectedNetwork, setSelectedNetwork] = useState<'base' | 'celo'>('base');
  
  // Form state
  const [task, setTask] = useState('');
  const [delivery, setDelivery] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string>('');
  const [selectedToken, setSelectedToken] = useState<PaymentToken | CeloPaymentToken>(SUPPORTED_TOKENS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string>('');
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  // Animation setup (copied from landing page)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }) + " UTC");
    };
    
    const interval = setInterval(updateTime, 1000);
    updateTime();
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVerificationsCount(prev => prev + Math.floor(Math.random() * 3));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Verification Pattern Animation (same as landing)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    const verificationChars = "✓◯△□●◆▲▼◈◉⬢⬡⬟⬜⬛";
    const dataChars = "01010101";

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };

    const noise = (x: number, y: number, t: number) => {
      return Math.sin(x * 0.01 + t) * Math.cos(y * 0.008 + t * 0.7) + 
             Math.sin(x * 0.005 - t * 0.3) * Math.cos(y * 0.012 + t * 0.2);
    };

    const render = () => {
      const start = performance.now();
      const rect = canvas.getBoundingClientRect();
      
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      
      const charSize = 12;
      const cols = Math.ceil(rect.width / charSize);
      const rows = Math.ceil(rect.height / charSize);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const posX = x * charSize;
          const posY = y * charSize;
          
          const dx = posX - mousePos.x;
          const dy = posY - mousePos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          const noiseVal = noise(x, y, time);
          const flowIntensity = 0.3 + Math.sin(x * 0.05 + time) * 0.2;
          
          if (Math.abs(noiseVal) > flowIntensity) {
            let char: string;
            let alpha: number;
            
            if (dist < 150) {
              const proximity = 1 - (dist / 150);
              char = dataChars[Math.floor((x + y + time * 10) % dataChars.length)];
              alpha = proximity * 0.8;
              ctx.fillStyle = `rgba(15, 23, 42, ${alpha})`;
            } else {
              const verified = noiseVal > 0.6;
              if (verified) {
                char = verificationChars[Math.floor(Math.abs(noiseVal * 10) % verificationChars.length)];
                alpha = 0.15 + (Math.abs(noiseVal) - 0.6) * 0.3;
                ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`;
              } else {
                char = '◯';
                alpha = 0.05 + Math.abs(noiseVal) * 0.1;
                ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`;
              }
            }
            
            const pulsePhase = Math.sin(time * 2 + (x + y) * 0.1);
            const pulseAlpha = alpha * (1 + pulsePhase * 0.1);
            
            ctx.globalAlpha = pulseAlpha;
            ctx.fillText(char, posX, posY);
            ctx.globalAlpha = 1;
          }
        }
      }
      
      time += 0.02;
      setRenderTime(performance.now() - start);
      animationId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', resize);
    resize();
    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [mousePos]);

  // Network switching
  const switchNetwork = (network: 'base' | 'celo') => {
    setSelectedNetwork(network);
    setSelectedToken(network === 'base' ? SUPPORTED_TOKENS[0] : CELO_SUPPORTED_TOKENS[0]);
    setIsConnected(false);
    setUserAddress('');
    setUserStats(null);
  };

  const currentTokens = selectedNetwork === 'base' ? SUPPORTED_TOKENS : CELO_SUPPORTED_TOKENS;
  const currentService = selectedNetwork === 'base' ? web3Service : celoWeb3Service;
  const contractAddress = selectedNetwork === 'base' ? BASE_CONTRACT_ADDRESS : CELO_CONTRACT_ADDRESS;

  const connectWallet = async () => {
    try {
      const { address } = await currentService.connect();
      setUserAddress(address);
      setIsConnected(true);
      setError('');
      
      // Load user stats for Celo
      if (selectedNetwork === 'celo') {
        const stats = await celoWeb3Service.getUserStats(contractAddress, address);
        setUserStats(stats);
      }
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
      const { requestId, txHash } = await currentService.requestVerification(
        contractAddress,
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
        const verification = selectedNetwork === 'base' 
          ? await web3Service.getVerification(contractAddress, requestId)
          : await celoWeb3Service.getVerificationWithReputation(contractAddress, requestId);
        
        if (verification.completed) {
          setResult(prev => prev ? {
            ...prev,
            score: verification.score,
            reasoning: verification.reasoning,
            completed: true
          } : null);
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
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden relative" style={{ cursor: 'none' }}>
      {/* Animated Background Canvas */}
      <canvas 
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Custom Cursor */}
      <div 
        className="fixed w-1 h-1 bg-slate-900 rounded-full z-50 pointer-events-none"
        style={{ 
          left: mousePos.x - 2, 
          top: mousePos.y - 2,
          mixBlendMode: 'difference',
          backgroundColor: 'white'
        }}
      />
      <div 
        className="fixed w-8 h-8 border border-slate-400 rounded-full z-50 pointer-events-none transition-all duration-200"
        style={{ 
          left: mousePos.x - 16, 
          top: mousePos.y - 16,
          mixBlendMode: 'difference',
          borderColor: 'white'
        }}
      />

      {/* Navigation */}
      <nav className="bg-white/90 border-b border-slate-200 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center space-x-4">
              <div className="w-6 h-6 bg-slate-900 flex items-center justify-center text-xs font-mono text-white">
                V
              </div>
              <span className="text-lg font-medium tracking-tight">VerifyAgent</span>
            </a>
            
            <div className="flex items-center space-x-6">
              {/* Network Switcher */}
              <div className="relative">
                <select 
                  value={selectedNetwork}
                  onChange={(e) => switchNetwork(e.target.value as 'base' | 'celo')}
                  className="appearance-none bg-slate-100 px-3 py-1 rounded text-sm font-medium cursor-pointer"
                >
                  <option value="base">Base Network</option>
                  <option value="celo">Celo Network</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 pointer-events-none" />
              </div>
              
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wide">
                {currentTime}
              </span>
              
              {isConnected ? (
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 border border-green-200 rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700">
                    {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                  </span>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="h-9 px-4 bg-slate-900 text-white text-sm hover:bg-slate-800 transition-colors flex items-center space-x-2"
                >
                  <Wallet size={14} />
                  <span>Connect</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto px-8 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-light leading-tight mb-8 tracking-tight">
              AI verification oracle
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8 font-light">
              Submit work → Get AI analysis → Receive cryptographic proof.<br />
              Now supporting {selectedNetwork === 'base' ? 'Base L2' : 'Celo'} with multiple payment tokens.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Verification Form */}
            <div className="lg:col-span-2 space-y-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Task Description
                  </label>
                  <textarea
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="Describe the task that was assigned..."
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 placeholder-slate-400 bg-white/80 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Delivery/Output
                  </label>
                  <textarea
                    value={delivery}
                    onChange={(e) => setDelivery(e.target.value)}
                    placeholder="Paste the completed work, output, or deliverable..."
                    rows={6}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 placeholder-slate-400 bg-white/80 backdrop-blur-sm"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !isConnected || !task.trim() || !delivery.trim()}
                  className="w-full flex items-center justify-center space-x-3 px-8 py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200"
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

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Payment Method */}
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg p-6">
                <h3 className="text-sm font-medium text-slate-700 mb-4">Payment Method</h3>
                <div className="space-y-3">
                  {currentTokens.map((token) => {
                    const isSelected = selectedToken.address === token.address;
                    return (
                      <button
                        key={token.address}
                        onClick={() => setSelectedToken(token)}
                        className={`w-full p-3 rounded-lg border transition-all text-left ${
                          isSelected 
                            ? 'border-slate-400 bg-slate-50' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{token.icon}</span>
                          <div>
                            <div className="font-medium text-slate-900">{token.symbol}</div>
                            <div className="text-xs text-slate-500">
                              {selectedNetwork === 'base' ? 'Base Network' : 'Celo Network'}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {!isConnected && (
                  <div className="text-xs text-slate-500 text-center mt-4">
                    Connect wallet to see balances
                  </div>
                )}
              </div>

              {/* User Stats (Celo only) */}
              {selectedNetwork === 'celo' && userStats && (
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-slate-700 mb-4">Your Reputation</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Score</span>
                      <span className="font-mono text-slate-900">{userStats.currentReputation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Verifications</span>
                      <span className="text-slate-900">{userStats.verificationCount}</span>
                    </div>
                    {userStats.feeDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Fee Discount</span>
                        <span className="text-green-600">{userStats.feeDiscount}% off</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* How it works */}
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg p-6">
                <h3 className="text-sm font-medium text-slate-700 mb-4">How it works</h3>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold mt-0.5">1</div>
                    <div>Submit task description and delivery</div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold mt-0.5">2</div>
                    <div>Pay with {selectedNetwork === 'base' ? 'ETH, USDC, or DAI' : 'CELO, cUSD, or cEUR'}</div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold mt-0.5">3</div>
                    <div>AI evaluates quality and posts on-chain verdict</div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold mt-0.5">4</div>
                    <div>Get score (0-100) with detailed reasoning</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="mt-16">
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-medium text-slate-900">Verification Result</h3>
                  <div className="flex items-center space-x-2">
                    {result.completed ? (
                      <CheckCircle size={20} className="text-green-500" />
                    ) : (
                      <Clock size={20} className="text-yellow-500 animate-pulse" />
                    )}
                    <span className={`text-sm ${result.completed ? 'text-green-600' : 'text-yellow-600'}`}>
                      {result.completed ? 'Completed' : 'Processing...'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-slate-500 mb-2">Request ID</div>
                    <div className="font-mono text-sm bg-slate-100 p-3 rounded break-all">
                      {result.requestId}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-slate-500 mb-2">Transaction</div>
                    <a 
                      href={selectedNetwork === 'base' 
                        ? `https://basescan.org/tx/${result.txHash}` 
                        : `https://explorer.celo.org/tx/${result.txHash}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-slate-600 hover:text-slate-800"
                    >
                      <span className="font-mono text-sm">{result.txHash.slice(0, 10)}...</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>

                {result.completed && result.score !== undefined && (
                  <div className="mt-8 pt-8 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-sm text-slate-500">Quality Score</div>
                      <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                        {result.score}/100 ({getScoreLabel(result.score)})
                      </div>
                    </div>
                    
                    {result.reasoning && (
                      <div>
                        <div className="text-sm text-slate-500 mb-3">AI Reasoning</div>
                        <div className="bg-slate-100 p-4 rounded-lg text-slate-700">
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
    </div>
  );
}