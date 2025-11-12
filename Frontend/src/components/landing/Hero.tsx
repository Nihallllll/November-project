import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { TypeAnimation } from "react-type-animation";

interface HeroProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
}

export const Hero = ({ onGetStarted, onLogin }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated mesh background */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            {/* Trust indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-secondary animate-glow" />
              <span className="text-sm text-muted-foreground">
                Trusted by 10,000+ crypto traders
              </span>
            </motion.div>

            {/* Main headline with gradient animation */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-gradient">
                Automate Your Crypto
              </span>
              <br />
              <TypeAnimation
                sequence={[
                  "with Visual Workflows",
                  2000,
                  "with AI-Powered Agents",
                  2000,
                  "with No-Code Builder",
                  2000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                className="text-foreground"
              />
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Build complex crypto workflows visually. No code required. Just drag, drop,
              and deploy powerful blockchain automation in minutes.
            </p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                size="lg"
                onClick={onGetStarted}
                className="group relative overflow-hidden bg-gradient-to-r from-primary via-secondary to-accent text-lg px-8 py-6 glow-primary"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Building Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="glass text-lg px-8 py-6 group border-primary/50 hover:border-primary"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-muted-foreground mt-8"
            >
              No credit card required • Set up in 2 minutes
            </motion.p>
          </motion.div>

          {/* Hero image with 3D effect */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="relative perspective-1000"
          >
            <div className="relative rounded-2xl overflow-hidden glass glow-secondary">
              <div className="w-full aspect-video bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">🔗</div>
                  <p className="text-xl font-semibold">Workflow Canvas Preview</p>
                  <p className="text-sm text-muted-foreground mt-2">Visual drag-and-drop builder</p>
                </div>
              </div>
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </div>

            {/* Floating cards */}
            <motion.div
              className="absolute -left-4 top-20 glass p-4 rounded-xl max-w-[200px] hidden lg:block"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="text-xs text-muted-foreground mb-1">Live Workflow</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary animate-glow" />
                <span className="text-sm font-medium">Jupiter Swap Active</span>
              </div>
            </motion.div>

            <motion.div
              className="absolute -right-4 bottom-20 glass p-4 rounded-xl max-w-[200px] hidden lg:block"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            >
              <div className="text-xs text-muted-foreground mb-1">AI Agent</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-glow" />
                <span className="text-sm font-medium">Analyzing Market</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
