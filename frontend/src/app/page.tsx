"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, Shield, Zap, Coins, CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">VerifyAgent</h1>
                <p className="text-xs text-muted-foreground">AI Oracle • Base L2</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">Connect Wallet</Button>
              <Button>Launch App</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="py-20 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto">
              The first verification oracle with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                universal payment
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Agents verify work using any token via Uniswap integration. 
              Pay with ETH, USDC, DAI, or any ERC-20 token on Base L2.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center gap-4"
          >
            <Button size="xl" className="gap-2 shadow-lg">
              Start Verification
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="xl">
              View Demo
            </Button>
          </motion.div>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center justify-center gap-8 mt-16 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>47 verifications completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>$12.4K value verified</span>
            </div>
          </motion.div>
        </motion.section>

        {/* Features */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="py-16"
        >
          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-8 rounded-xl bg-white shadow-sm border hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">AI-Powered Evaluation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Advanced AI models assess task completion quality with detailed reasoning, 
                scoring, and actionable feedback for continuous improvement.
              </p>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-8 rounded-xl bg-white shadow-sm border hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Blockchain Verified</h3>
              <p className="text-muted-foreground leading-relaxed">
                All verdicts posted immutably on Base L2 with cryptographic proof, 
                transparent history, and dispute resolution mechanisms.
              </p>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-8 rounded-xl bg-white shadow-sm border hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Coins className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Universal Payment</h3>
              <p className="text-muted-foreground leading-relaxed">
                Pay with any token via Uniswap auto-swap. Support for 1000+ tokens 
                including ETH, USDC, DAI, and custom project tokens.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* How it Works */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="py-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How VerifyAgent Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Simple 3-step process to get your work verified by AI with blockchain proof
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Submit Task",
                description: "Upload your work, define success criteria, and choose payment token",
                icon: "📋"
              },
              {
                step: "02", 
                title: "AI Analysis",
                description: "Advanced AI models evaluate quality, completeness, and adherence to requirements",
                icon: "🤖"
              },
              {
                step: "03",
                title: "Get Results",
                description: "Receive detailed feedback, score, and blockchain-verified proof of evaluation",
                icon: "✅"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * index }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  {item.icon}
                </div>
                <div className="text-sm text-primary font-semibold mb-2">STEP {item.step}</div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="py-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to verify your next project?</h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join hundreds of agents and teams using VerifyAgent for quality assurance
            </p>
            <Button size="xl" variant="secondary" className="shadow-lg">
              Get Started Now
            </Button>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-8">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>© 2026 VerifyAgent. Built for Synthesis Hackathon.</div>
            <div className="flex items-center gap-4">
              <span>Powered by Base L2</span>
              <span>•</span>
              <span>Uniswap Integration</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}