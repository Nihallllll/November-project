import { motion } from "framer-motion";
import { TrendingUp, Wallet, Hexagon } from "lucide-react";

const useCases = [
  {
    icon: TrendingUp,
    title: "Trading Bot",
    description: "Monitor Pyth prices → AI decision → Execute Jupiter swap → Log results",
    workflow: ["Price Monitor", "AI Analysis", "Execute Swap", "Alert"],
    gradient: "from-primary to-secondary",
  },
  {
    icon: Wallet,
    title: "Portfolio Tracker",
    description: "Watch wallet → Check balances → Store in DB → Send daily Telegram report",
    workflow: ["Wallet Watch", "Balance Check", "Database", "Report"],
    gradient: "from-secondary to-accent",
  },
  {
    icon: Hexagon,
    title: "NFT Sniper",
    description: "Helius indexer → New listing detected → Condition check → Auto purchase → Alert",
    workflow: ["NFT Monitor", "Condition", "Purchase", "Notify"],
    gradient: "from-accent to-primary",
  },
];

export const UseCases = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">Real-World</span> Use Cases
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how traders and developers are automating their crypto operations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="glass p-8 rounded-2xl h-full relative overflow-hidden">
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${useCase.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${useCase.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <useCase.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3">{useCase.title}</h3>
                  <p className="text-muted-foreground mb-6">{useCase.description}</p>

                  {/* Visual workflow */}
                  <div className="space-y-2">
                    {useCase.workflow.map((step, stepIndex) => (
                      <motion.div
                        key={stepIndex}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * stepIndex }}
                        className="flex items-center gap-2"
                      >
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${useCase.gradient}`} />
                        <span className="text-sm text-muted-foreground">{step}</span>
                        {stepIndex < useCase.workflow.length - 1 && (
                          <div className="flex-1 h-px bg-border ml-2" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Glow effect */}
                <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br ${useCase.gradient} opacity-20 rounded-full blur-3xl group-hover:opacity-30 transition-opacity`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
