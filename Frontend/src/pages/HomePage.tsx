import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Brain, Shield, Layers } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-cyan-600">
                Automate Your Crypto
              </span>
              <br />
              <span className="text-foreground">Workflows Visually</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
              Build powerful blockchain automation workflows with AI, triggers, and 18+ nodes.
              No code required - just drag, drop, and connect.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg text-lg font-semibold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-card border-2 border-border rounded-lg text-lg font-semibold hover:bg-accent transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Demo Image Placeholder */}
          <div className="mt-20 relative">
            <div className="relative rounded-2xl border-2 border-border shadow-2xl overflow-hidden bg-card">
              <div className="aspect-video bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <Layers className="w-20 h-20 mx-auto mb-4 text-primary opacity-50" />
                  <p className="text-2xl font-semibold text-muted-foreground">
                    Visual Workflow Builder
                  </p>
                  <p className="text-muted-foreground mt-2">
                    Drag, drop, and connect nodes to create automation
                  </p>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to automate your crypto operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
              <p className="text-muted-foreground">
                GPT-4 agents with memory, tools, and custom instructions for intelligent automation
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Triggers</h3>
              <p className="text-muted-foreground">
                Webhooks, wallet monitoring, and blockchain event indexing with Helius
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Safe</h3>
              <p className="text-muted-foreground">
                Encrypted credentials, secure execution, and comprehensive error handling
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                <Layers className="w-6 h-6 text-cyan-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">18+ Nodes</h3>
              <p className="text-muted-foreground">
                Blockchain, AI, notifications, databases, and more - all visually connected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What You Can Build</h2>
            <p className="text-xl text-muted-foreground">
              Endless possibilities for crypto automation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-8">
              <h3 className="text-2xl font-semibold mb-4">🤖 Trading Bots</h3>
              <p className="text-muted-foreground mb-4">
                Automated trading strategies with price monitoring, Jupiter swaps, and AI decision-making
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-purple-500/20 rounded">Pyth Price</span>
                <span className="text-xs px-2 py-1 bg-purple-500/20 rounded">Jupiter</span>
                <span className="text-xs px-2 py-1 bg-purple-500/20 rounded">AI Agent</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-8">
              <h3 className="text-2xl font-semibold mb-4">📊 Portfolio Tracker</h3>
              <p className="text-muted-foreground mb-4">
                Monitor wallet balances, track transactions, and get notifications via Telegram or Email
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-blue-500/20 rounded">Watch Wallet</span>
                <span className="text-xs px-2 py-1 bg-blue-500/20 rounded">Balance</span>
                <span className="text-xs px-2 py-1 bg-blue-500/20 rounded">Telegram</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 rounded-xl p-8">
              <h3 className="text-2xl font-semibold mb-4">⚡ Event Automation</h3>
              <p className="text-muted-foreground mb-4">
                React to blockchain events, NFT sales, token transfers with conditional logic
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-cyan-500/20 rounded">Helius</span>
                <span className="text-xs px-2 py-1 bg-cyan-500/20 rounded">Condition</span>
                <span className="text-xs px-2 py-1 bg-cyan-500/20 rounded">Webhook</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-purple-600 to-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Automate?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Start building powerful crypto workflows in minutes
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all hover:scale-105 shadow-xl"
          >
            Create Your First Workflow
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">© 2025 Crypto Workflow Automation. Built with React & Solana.</p>
            <p className="text-sm">Powered by ReactFlow, OpenAI, and Helius</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
