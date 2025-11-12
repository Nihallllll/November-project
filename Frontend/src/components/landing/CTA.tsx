import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface CTAProps {
  onGetStarted?: () => void;
}

export const CTA = ({ onGetStarted }: CTAProps) => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
      
      {/* Animated particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="glass p-12 md:p-16 rounded-3xl relative overflow-hidden glow-primary">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />
            
            <div className="relative z-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="inline-flex mb-6"
              >
                <Sparkles className="w-12 h-12 text-primary" />
              </motion.div>

              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Ready to <span className="text-gradient">Automate Your Crypto?</span>
              </h2>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join 10,000+ traders and developers building powerful workflows today
              </p>

              <Button
                size="lg"
                onClick={onGetStarted}
                className="group bg-gradient-to-r from-primary via-secondary to-accent text-lg px-8 py-6 glow-primary"
              >
                <span className="flex items-center gap-2">
                  Start Building Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>

              <p className="text-sm text-muted-foreground mt-6">
                No credit card required • Set up in 2 minutes
              </p>
            </div>

            {/* Corner glows */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-primary to-secondary opacity-20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-accent to-primary opacity-20 rounded-full blur-3xl" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
