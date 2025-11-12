import { motion } from "framer-motion";
import { Brain, Zap, DollarSign, GitBranch, Bell, Shield } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Agent",
    description: "GPT-4 powered agents with memory, tools, and custom instructions",
    gradient: "from-primary to-secondary",
  },
  {
    icon: Zap,
    title: "Real-time Triggers",
    description: "Webhooks, wallet monitoring, Helius blockchain indexing",
    gradient: "from-secondary to-accent",
  },
  {
    icon: DollarSign,
    title: "DeFi Integration",
    description: "Jupiter swaps, Pyth prices, token transfers, wallet balance checks",
    gradient: "from-accent to-primary",
  },
  {
    icon: GitBranch,
    title: "Conditional Logic",
    description: "If-then-else branching, merge nodes, complex decision trees",
    gradient: "from-primary to-accent",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Telegram, Email, Discord - get alerted instantly",
    gradient: "from-secondary to-primary",
  },
  {
    icon: Shield,
    title: "Secure & Safe",
    description: "Encrypted credentials, safe execution, comprehensive error handling",
    gradient: "from-accent to-secondary",
  },
];

export const Features = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need to
            <span className="text-gradient"> Automate Crypto</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect 18+ pre-built nodes for triggers, blockchain operations, AI decision-making, and notifications
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, rotateY: 5, rotateX: 5 }}
              className="group perspective-card"
            >
              <div className="glass p-8 rounded-2xl h-full relative overflow-hidden">
                {/* Gradient glow effect on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>

                {/* Corner accent */}
                <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
