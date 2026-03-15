"use client";

import { CheckCircle, Shield, Zap, ArrowRight, Play } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export default function VerifyAgentHome() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [renderTime, setRenderTime] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [verificationsCount, setVerificationsCount] = useState(247);

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

  // Verification Pattern Animation
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

      // Create verification flow pattern
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const posX = x * charSize;
          const posY = y * charSize;
          
          // Distance from mouse
          const dx = posX - mousePos.x;
          const dy = posY - mousePos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Verification flow waves
          const noiseVal = noise(x, y, time);
          const flowIntensity = 0.3 + Math.sin(x * 0.05 + time) * 0.2;
          
          // Only render in verification flow areas
          if (Math.abs(noiseVal) > flowIntensity) {
            let char: string;
            let alpha: number;
            
            if (dist < 150) {
              // Mouse proximity effect - show data streams
              const proximity = 1 - (dist / 150);
              char = dataChars[Math.floor((x + y + time * 10) % dataChars.length)];
              alpha = proximity * 0.8;
              ctx.fillStyle = `rgba(15, 23, 42, ${alpha})`;
            } else {
              // Background verification symbols
              const verified = noiseVal > 0.6;
              if (verified) {
                char = verificationChars[Math.floor(Math.abs(noiseVal * 10) % verificationChars.length)];
                alpha = 0.15 + (Math.abs(noiseVal) - 0.6) * 0.3;
                ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`; // Green for verified
              } else {
                char = '◯';
                alpha = 0.05 + Math.abs(noiseVal) * 0.1;
                ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`; // Slate for pending
              }
            }
            
            // Add oracle pulse effect
            const pulsePhase = Math.sin(time * 2 + (x + y) * 0.1);
            const pulseAlpha = alpha * (1 + pulsePhase * 0.1);
            
            ctx.globalAlpha = pulseAlpha;
            ctx.fillText(char, posX, posY);
            ctx.globalAlpha = 1;
          }
        }
      }
      
      // Oracle center beacon
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const beaconRadius = 100 + Math.sin(time * 2) * 20;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, beaconRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 + Math.sin(time * 3) * 0.05})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      
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
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-6 h-6 bg-slate-900 flex items-center justify-center text-xs font-mono text-white">
                V
              </div>
              <div>
                <span className="text-lg font-medium tracking-tight">VerifyAgent</span>
                <span className="text-xs text-slate-500 ml-3 font-mono uppercase tracking-wide">Oracle System</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wide">
                {currentTime}
              </span>
              <button className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Documentation
              </button>
              <button className="h-9 px-4 border border-slate-300 text-slate-900 text-sm hover:bg-slate-50 transition-colors">
                Connect Wallet
              </button>
              <button className="h-9 px-4 bg-slate-900 text-white text-sm hover:bg-slate-800 transition-colors">
                Launch Oracle
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Corner Indices */}
      <div className="fixed top-8 right-8 text-4xl font-light z-30">A</div>
      <div className="fixed bottom-8 left-8 text-4xl font-light z-30">1</div>
      <div className="fixed bottom-8 right-8 text-4xl font-light z-30">Ω</div>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-8 py-24 relative z-10">
        <div className="max-w-4xl">
          <h1 className="text-6xl font-light leading-tight mb-8 tracking-tight">
            Autonomous Intelligence<br />
            <span className="text-slate-600">Verification Oracle</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl leading-relaxed mb-12 font-light">
            Submit agent deliverables → Receive cryptographic analysis → 
            Get blockchain attestation. Universal payment via Uniswap integration on Base L2.
          </p>
          
          <div className="flex items-center space-x-6 mb-16">
            <button className="h-11 px-6 bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center space-x-2">
              <span>Initialize Verification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="h-11 px-6 border border-slate-300 text-slate-900 hover:bg-slate-50 transition-colors flex items-center space-x-2">
              <Play className="w-4 h-4" />
              <span>System Demo</span>
            </button>
          </div>
        </div>

        {/* Technical Telemetry */}
        <div className="absolute bottom-0 left-8 font-mono text-xs text-slate-500 leading-relaxed">
          <div>RENDER: {renderTime.toFixed(1)}ms</div>
          <div>CURSOR: X:{mousePos.x} Y:{mousePos.y}</div>
          <div>STATUS: ACTIVE</div>
          <div>VERIFICATIONS: {verificationsCount.toLocaleString()}</div>
        </div>
      </section>

      {/* Oracle Analysis Engine */}
      <section className="bg-slate-50/90 py-20 border-y border-slate-200 relative z-10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-4">
              <div className="font-mono text-xs text-slate-500 uppercase tracking-wide mb-2">
                Analysis Engine
              </div>
              <h2 className="text-2xl font-light mb-6">
                Real-time Oracle<br />Intelligence System
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Watch the AI oracle evaluate deliverable quality through systematic 
                analysis protocols with live feedback streams.
              </p>
            </div>
            
            <div className="col-span-8">
              <div className="bg-white/90 border border-slate-200 p-8 backdrop-blur-sm">
                <div className="space-y-1">
                  <div className="flex items-center justify-between py-3 text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-mono text-slate-900">COMPLETENESS_CHECK</span>
                    </div>
                    <span className="font-mono text-green-600">✓ 0.847</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 text-sm border-t border-slate-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="font-mono text-slate-900">QUALITY_ANALYSIS</span>
                    </div>
                    <span className="font-mono text-blue-600">△ {renderTime.toFixed(3)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 text-sm border-t border-slate-100 opacity-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 border border-slate-300 rounded-full"></div>
                      <span className="font-mono text-slate-500">REQUIREMENT_ADHERENCE</span>
                    </div>
                    <span className="font-mono text-slate-400">◯ PENDING</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 text-sm border-t border-slate-100 opacity-30">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 border border-slate-300 rounded-full"></div>
                      <span className="font-mono text-slate-500">CRYPTOGRAPHIC_SEAL</span>
                    </div>
                    <span className="font-mono text-slate-400">◯ QUEUED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Metrics */}
      <section className="py-20 relative z-10">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-4 gap-12">
            <div>
              <div className="font-mono text-xs text-slate-500 uppercase tracking-wide mb-2">
                Verifications
              </div>
              <div className="text-4xl font-light mb-1">{verificationsCount.toLocaleString()}</div>
              <div className="text-xs text-slate-500">Complete</div>
            </div>
            <div>
              <div className="font-mono text-xs text-slate-500 uppercase tracking-wide mb-2">
                Value Secured
              </div>
              <div className="text-4xl font-light mb-1">$47.2K</div>
              <div className="text-xs text-slate-500">Total Verified</div>
            </div>
            <div>
              <div className="font-mono text-xs text-slate-500 uppercase tracking-wide mb-2">
                Accuracy Rate
              </div>
              <div className="text-4xl font-light mb-1">99.4%</div>
              <div className="text-xs text-slate-500">Validated</div>
            </div>
            <div>
              <div className="font-mono text-xs text-slate-500 uppercase tracking-wide mb-2">
                Response Time
              </div>
              <div className="text-4xl font-light mb-1">{renderTime.toFixed(1)}s</div>
              <div className="text-xs text-slate-500">Average</div>
            </div>
          </div>
        </div>
      </section>

      {/* Oracle Capabilities */}
      <section className="bg-white/90 py-20 border-t border-slate-200 relative z-10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-8">
          <div className="mb-16">
            <div className="font-mono text-xs text-slate-500 uppercase tracking-wide mb-4">
              Core Systems
            </div>
            <h2 className="text-3xl font-light">Oracle Capabilities</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div>
              <div className="w-8 h-8 bg-slate-100 flex items-center justify-center mb-6">
                <Zap className="w-4 h-4 text-slate-700" />
              </div>
              <h3 className="text-lg font-medium mb-4">AI Analysis Engine</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Advanced language models evaluate deliverable quality through systematic 
                protocols, generating detailed scoring matrices and improvement recommendations.
              </p>
            </div>
            
            <div>
              <div className="w-8 h-8 bg-slate-100 flex items-center justify-center mb-6">
                <Shield className="w-4 h-4 text-slate-700" />
              </div>
              <h3 className="text-lg font-medium mb-4">Cryptographic Attestation</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Every oracle decision recorded immutably on Base L2 with cryptographic 
                signatures, timestamps, and tamper-evident audit trails.
              </p>
            </div>
            
            <div>
              <div className="w-8 h-8 bg-slate-100 flex items-center justify-center mb-6">
                <div className="w-4 h-4 text-slate-700 font-mono text-xs">Ξ</div>
              </div>
              <h3 className="text-lg font-medium mb-4">Universal Settlement</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Pay verification fees with any ERC-20 token via automatic Uniswap 
                conversion protocols. Support for 1000+ token standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Oracle Protocol */}
      <section className="py-20 bg-slate-50/90 relative z-10">
        <div className="max-w-6xl mx-auto px-8">
          <div className="mb-16">
            <div className="font-mono text-xs text-slate-500 uppercase tracking-wide mb-4">
              Execution Protocol
            </div>
            <h2 className="text-3xl font-light">Three-Phase Oracle Process</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="w-12 h-12 bg-slate-900 text-white flex items-center justify-center text-lg font-mono mb-6">
                01
              </div>
              <h3 className="text-lg font-medium mb-4">Submission Protocol</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Upload deliverables via secure channels, define verification parameters, 
                select payment token, and initialize oracle analysis sequence.
              </p>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-slate-900 text-white flex items-center justify-center text-lg font-mono mb-6">
                02
              </div>
              <h3 className="text-lg font-medium mb-4">Analysis Execution</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                AI oracle systems evaluate completeness, quality metrics, and requirement 
                adherence through multi-model consensus protocols.
              </p>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-slate-900 text-white flex items-center justify-center text-lg font-mono mb-6">
                03
              </div>
              <h3 className="text-lg font-medium mb-4">Attestation Output</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Receive comprehensive analysis reports, quality scores, and 
                blockchain-verified attestation certificates with audit trails.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-slate-900 py-20 text-white relative z-10">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-light mb-8">
            Initialize Oracle Sequence
          </h2>
          <p className="text-lg text-slate-300 mb-12 max-w-2xl mx-auto font-light">
            Enter the agent economy with cryptographically verified intelligence protocols
          </p>
          <button className="h-12 px-8 bg-white text-slate-900 hover:bg-slate-100 transition-colors font-medium">
            Launch Oracle System
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/90 border-t border-slate-200 py-12 relative z-10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-slate-900 flex items-center justify-center text-xs font-mono text-white">
                V
              </div>
              <span className="text-slate-600 font-mono text-xs">© 2026 VerifyAgent • Synthesis Hackathon</span>
            </div>
            <div className="flex items-center space-x-8 text-xs font-mono text-slate-500">
              <span>Base L2</span>
              <span>Uniswap Protocol</span>
              <span>Oracle Technology</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}