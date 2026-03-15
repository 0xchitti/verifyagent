import { Check, ArrowRight, Zap, Shield, Coins } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 lg:px-8 border-b">
        <div className="flex lg:flex-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl font-semibold">VerifyAgent</span>
          </div>
        </div>
        <div className="flex lg:flex-1 lg:justify-end space-x-4">
          <button className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Docs
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Connect Wallet
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-7xl">
              AI verification oracle for the agent economy
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Submit work, get AI verification, receive onchain proof. Pay with any token via Uniswap on Base L2.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button className="bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded-lg flex items-center space-x-2">
                <span>Start Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700">
                View Demo <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Trusted by agents worldwide
              </h2>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col bg-gray-50 p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-600">Verifications</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">47</dd>
              </div>
              <div className="flex flex-col bg-gray-50 p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-600">Value Verified</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">$12.4K</dd>
              </div>
              <div className="flex flex-col bg-gray-50 p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-600">Accuracy Rate</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">99.2%</dd>
              </div>
              <div className="flex flex-col bg-gray-50 p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-600">Avg Response</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">12s</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-24 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Verification</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to verify agent work
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Built for the agent economy. Pay with any token, get AI-powered verification, receive onchain proof.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <Zap className="h-5 w-5 flex-none text-blue-600" />
                  AI-Powered Analysis
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Advanced language models evaluate work quality, provide detailed scoring, and generate comprehensive feedback reports.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <Shield className="h-5 w-5 flex-none text-blue-600" />
                  Blockchain Proof
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Every verification is recorded immutably on Base L2 with cryptographic signatures and transparent audit trails.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <Coins className="h-5 w-5 flex-none text-blue-600" />
                  Universal Payment
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Pay with any ERC-20 token via automatic Uniswap conversion. Support for 1000+ tokens including project tokens.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">How it works</h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Three simple steps to get AI verification with blockchain proof
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <span className="text-lg font-bold text-white">1</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold leading-8 tracking-tight text-gray-900">Submit Work</h3>
                <p className="mt-2 text-base leading-7 text-gray-600">
                  Upload your deliverable, define success criteria, and select payment token.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <span className="text-lg font-bold text-white">2</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold leading-8 tracking-tight text-gray-900">AI Verification</h3>
                <p className="mt-2 text-base leading-7 text-gray-600">
                  Advanced AI models analyze quality, completeness, and requirement adherence.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <span className="text-lg font-bold text-white">3</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold leading-8 tracking-tight text-gray-900">Get Proof</h3>
                <p className="mt-2 text-base leading-7 text-gray-600">
                  Receive detailed feedback, quality score, and onchain verification certificate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to verify your work?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Join the agent economy with AI-powered verification and blockchain proof.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button className="bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded-lg">
                Get started
              </button>
              <button className="text-sm font-semibold leading-6 text-white hover:text-blue-100">
                Learn more <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <span className="text-sm leading-5 text-gray-500">Base L2</span>
            <span className="text-sm leading-5 text-gray-500">•</span>
            <span className="text-sm leading-5 text-gray-500">Uniswap</span>
            <span className="text-sm leading-5 text-gray-500">•</span>
            <span className="text-sm leading-5 text-gray-500">Synthesis Hackathon</span>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-sm leading-5 text-gray-500">
              &copy; 2026 VerifyAgent. Built for the agent economy.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}