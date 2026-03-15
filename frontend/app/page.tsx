import { CheckCircle, Shield, Zap, ArrowRight, Play } from "lucide-react";

export default function VerifyAgentHome() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-slate-50 border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-slate-50/90">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-semibold text-slate-900">VerifyAgent</span>
                <span className="text-xs text-slate-600 ml-2">Oracle • Base L2</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">
                Documentation
              </button>
              <button className="h-10 px-5 border border-slate-200 bg-white text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                Connect Wallet
              </button>
              <button className="h-10 px-5 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors">
                Launch Oracle
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-semibold text-slate-900 leading-tight mb-6 tracking-tight">
            AI verification oracle with<br />
            <span className="text-blue-700">cryptographic proof</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Submit agent work → Receive AI analysis → Get blockchain verification certificate. 
            Pay with any token via Uniswap on Base L2.
          </p>
          
          <div className="flex items-center justify-center space-x-4 mt-10">
            <button className="h-12 px-6 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors flex items-center space-x-2">
              <span>Start Verification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="h-12 px-6 border border-slate-200 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center space-x-2">
              <Play className="w-4 h-4" />
              <span>View Demo</span>
            </button>
          </div>
        </div>

        {/* Verification Flow Preview - Signature Element */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Real-time Verification Analysis</h3>
            <p className="text-slate-600">Watch the AI oracle evaluate work quality in real-time</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-slate-900">Completeness Check</span>
              </div>
              <span className="text-sm font-medium text-green-600">✓ Verified</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-medium text-slate-900">Quality Analysis</span>
              </div>
              <span className="text-sm font-medium text-blue-600">Analyzing...</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 opacity-50">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border border-slate-300 rounded-full"></div>
                <span className="font-medium text-slate-900">Requirements Adherence</span>
              </div>
              <span className="text-sm font-medium text-slate-400">Pending</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 opacity-50">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border border-slate-300 rounded-full"></div>
                <span className="font-medium text-slate-900">Blockchain Certification</span>
              </div>
              <span className="text-sm font-medium text-slate-400">Pending</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-3xl font-semibold text-slate-900 mb-1">247</div>
            <div className="text-sm text-slate-600">Verifications Complete</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-semibold text-slate-900 mb-1">$47.2K</div>
            <div className="text-sm text-slate-600">Value Verified</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-semibold text-slate-900 mb-1">99.4%</div>
            <div className="text-sm text-slate-600">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-semibold text-slate-900 mb-1">8.2s</div>
            <div className="text-sm text-slate-600">Avg Response</div>
          </div>
        </div>
      </section>

      {/* Oracle Capabilities */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-slate-900 mb-4">Oracle Capabilities</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Advanced AI analysis with cryptographic verification and universal payment support
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="border border-slate-200 rounded-xl p-6 bg-white">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">AI-Powered Analysis</h3>
              <p className="text-slate-600 leading-relaxed">
                Advanced language models evaluate work quality with detailed reasoning, 
                scoring rubrics, and actionable feedback for continuous improvement.
              </p>
            </div>
            
            <div className="border border-slate-200 rounded-xl p-6 bg-white">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-green-700" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Blockchain Verification</h3>
              <p className="text-slate-600 leading-relaxed">
                Every oracle decision recorded immutably on Base L2 with cryptographic 
                signatures, timestamps, and transparent audit trails.
              </p>
            </div>
            
            <div className="border border-slate-200 rounded-xl p-6 bg-white">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-6">
                <div className="w-6 h-6 text-amber-700">⚡</div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Universal Payment</h3>
              <p className="text-slate-600 leading-relaxed">
                Pay verification fees with any ERC-20 token via automatic Uniswap 
                conversion. Support for 1000+ tokens including project-specific ones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Process */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-slate-900 mb-4">Oracle Process</h2>
            <p className="text-lg text-slate-600">Three-step verification with cryptographic proof</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-700 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-semibold">
                1
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Submit Work</h3>
              <p className="text-slate-600">
                Upload deliverables, define success criteria, select payment token, 
                and set verification parameters.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-700 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-semibold">
                2
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">AI Oracle Analysis</h3>
              <p className="text-slate-600">
                Advanced AI models evaluate completeness, quality, and requirement 
                adherence with detailed scoring.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-700 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-semibold">
                3
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Receive Certificate</h3>
              <p className="text-slate-600">
                Get detailed feedback, quality scores, and tamper-proof blockchain 
                verification certificate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-700 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-semibold text-white mb-6">
            Ready for AI verification?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join the agent economy with cryptographically verified quality assurance
          </p>
          <button className="h-12 px-8 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Launch Oracle Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-700 rounded-md flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-600">© 2026 VerifyAgent • Synthesis Hackathon</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-500">
              <span>Base L2</span>
              <span>•</span>
              <span>Uniswap Integration</span>
              <span>•</span>
              <span>AI Oracle Technology</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}