import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Mail, Lock, LogIn } from 'lucide-react';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { UseCases } from '../components/landing/UseCases';
import { Stats } from '../components/landing/Stats';
import { Pricing } from '../components/landing/Pricing';
import { CTA } from '../components/landing/CTA';
import { Footer } from '../components/landing/Footer';
import { toast } from 'sonner';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement actual authentication with backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('auth_token', 'demo_token_' + Date.now());
      localStorage.setItem('user_email', email);
      
      toast.success('Welcome back!');
      setShowLoginModal(false);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    localStorage.setItem('auth_token', 'demo_token_' + Date.now());
    localStorage.setItem('user_email', 'demo@example.com');
    toast.success('Logged in as demo user!');
    setShowLoginModal(false);
    navigate('/dashboard');
  };

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Login Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-6 right-6 z-50"
      >
        <Button
          onClick={() => setShowLoginModal(true)}
          className="glass backdrop-blur-xl border border-primary/20 hover:border-primary/40 shadow-lg"
          size="lg"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Login
        </Button>
      </motion.div>

      {/* Landing Page Sections */}
      <Hero onGetStarted={handleGetStarted} onLogin={() => setShowLoginModal(true)} />
      <Features />
      <UseCases />
      <Stats />
      <Pricing onGetStarted={handleGetStarted} />
      <CTA onGetStarted={handleGetStarted} />
      <Footer />

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setShowLoginModal(false)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="relative p-6 border-b border-border bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
                  <button
                    onClick={() => setShowLoginModal(false)}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                    Welcome Back
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sign in to continue to your workflows
                  </p>
                </div>

                {/* Form */}
                <div className="p-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                      </div>
                    </div>

                    {/* Remember & Forgot */}
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded" />
                        <span>Remember me</span>
                      </label>
                      <button
                        type="button"
                        className="text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    {/* Login Button */}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-opacity"
                      size="lg"
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  {/* Demo Login */}
                  <Button
                    type="button"
                    onClick={handleDemoLogin}
                    variant="outline"
                    className="w-full border-primary/50 hover:border-primary"
                    size="lg"
                  >
                    <motion.span
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      ✨
                    </motion.span>
                    Try Demo Mode
                  </Button>

                  {/* Sign Up Link */}
                  <p className="text-center text-sm text-muted-foreground mt-6">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setShowLoginModal(false);
                        navigate('/signup');
                      }}
                      className="text-primary font-semibold hover:underline"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
