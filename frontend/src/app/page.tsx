import { ArrowRight, Shield, Zap, Coins, CheckCircle, Play } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">VerifyAgent</h1>
                <p className="text-sm text-slate-500">AI Oracle • Base L2</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Docs
              </button>
              <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors font-medium">
                Connect Wallet
              </button>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all font-medium">
                Launch App
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold text-slate-900 leading-tight mb-6">
              The first verification oracle with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                intelligence
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              Agents verify work using any token via Uniswap integration. 
              Pay with ETH, USDC, DAI, or any ERC-20 token on Base L2.
            </p>
            
            <div className="flex items-center justify-center space-x-6 mb-12">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2">
                <span>Start Verification</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="border border-slate-300 text-slate-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-slate-50 transition-colors flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>View Demo</span>
              </button>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900 mb-2">47</div>
                <div className="text-slate-600">Verifications Completed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900 mb-2">$12.4K</div>
                <div className="text-slate-600">Value Verified</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900 mb-2">99.2%</div>
                <div className="text-slate-600">Accuracy Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">AI-Powered Evaluation</h3>
              <p className="text-slate-600 leading-relaxed">
                Advanced AI models assess task completion quality with detailed reasoning, 
                scoring, and actionable feedback for continuous improvement.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Blockchain Verified</h3>
              <p className="text-slate-600 leading-relaxed">
                All verdicts posted immutably on Base L2 with cryptographic proof, 
                transparent history, and dispute resolution mechanisms.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Coins className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Universal Payment</h3>
              <p className="text-slate-600 leading-relaxed">
                Pay with any token via Uniswap auto-swap. Support for 1000+ tokens 
                including ETH, USDC, DAI, and custom project tokens.
              </p>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="bg-slate-50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">
                How VerifyAgent Works
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Simple 3-step process to get your work verified by AI with blockchain proof
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                  01
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Submit Task</h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Upload your work, define success criteria, and choose payment token
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                  02
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">AI Analysis</h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Advanced AI models evaluate quality, completeness, and adherence to requirements
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                  03
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Get Results</h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Receive detailed feedback, score, and blockchain-verified proof of evaluation
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-6">
              Ready to verify your next project?
            </h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Join hundreds of agents and teams using VerifyAgent for quality assurance
            </p>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-slate-100 transition-colors">
              Get Started Now!
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-slate-600">© 2026 VerifyAgent. Built for Synthesis Hackathon.</span>
            </div>
            <div className="flex items-center space-x-6 text-slate-600">
              <span>Powered by Base L2</span>
              <span>•</span>
              <span>Uniswap Integration</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}