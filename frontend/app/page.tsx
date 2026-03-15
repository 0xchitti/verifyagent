"use client";

import { ArrowRight } from "lucide-react";
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
            <div className="flex items-center space-x-4">
              <div className="w-6 h-6 bg-slate-900 flex items-center justify-center text-xs font-mono text-white">
                V
              </div>
              <span className="text-lg font-medium tracking-tight">VerifyAgent</span>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wide">
                {currentTime}
              </span>
              <a href="/verify" className="h-9 px-4 bg-slate-900 text-white text-sm hover:bg-slate-800 transition-colors">
                Launch
              </a>
            </div>
          </div>
        </div>
      </nav>



      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-8 py-32 relative z-10">
        <div className="max-w-4xl">
          <h1 className="text-7xl font-light leading-tight mb-12 tracking-tight">
            AI verification oracle
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl leading-relaxed mb-16 font-light">
            Submit work → Get AI analysis → Receive cryptographic proof.<br />
            Pay with any token on Base L2.
          </p>
          
          <a href="/verify" className="h-12 px-8 bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center space-x-2 text-lg">
            <span>Start Verification</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>


      </section>

      {/* Live Verification Demo */}
      <section className="bg-slate-50/90 py-24 border-y border-slate-200 relative z-10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-12">
            <div className="col-span-5">
              <div className="font-mono text-xs text-slate-500 uppercase tracking-wide mb-2">
                Live Demo
              </div>
              <h2 className="text-3xl font-light mb-8">
                Watch AI verify work<br />in real-time
              </h2>
            </div>
            
            <div className="col-span-7">
              <div className="bg-white/90 border border-slate-200 p-8 backdrop-blur-sm">
                <div className="space-y-1">
                  <div className="flex items-center justify-between py-4 text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-mono">Completeness</span>
                    </div>
                    <span className="font-mono text-green-600">✓ 0.92</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-4 text-sm border-t border-slate-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="font-mono">Quality</span>
                    </div>
                    <span className="font-mono text-blue-600">△ {renderTime.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-4 text-sm border-t border-slate-100 opacity-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 border border-slate-300 rounded-full"></div>
                      <span className="font-mono">Requirements</span>
                    </div>
                    <span className="font-mono text-slate-400">◯ Queued</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-4 text-sm border-t border-slate-100 opacity-30">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 border border-slate-300 rounded-full"></div>
                      <span className="font-mono">Blockchain Proof</span>
                    </div>
                    <span className="font-mono text-slate-400">◯ Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 py-8 relative z-10 bg-white/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 flex items-center justify-between">
          <span className="text-slate-500 font-mono text-xs">© 2026 VerifyAgent</span>
          <span className="text-slate-500 font-mono text-xs">Base L2 • Synthesis Hackathon</span>
        </div>
      </footer>
    </div>
  );
}