import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingProps {
  onGetStarted?: () => void;
}

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for getting started",
    features: [
      "100 workflow runs/month",
      "5 active workflows",
      "Basic nodes",
      "Community support",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For serious automation",
    features: [
      "Unlimited workflow runs",
      "50 active workflows",
      "All nodes + AI agents",
      "Priority support",
      "Advanced analytics",
      "Custom integrations",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For teams and businesses",
    features: [
      "Custom workflow limits",
      "Unlimited active workflows",
      "Dedicated support",
      "White-label option",
      "SLA guarantee",
      "Custom nodes development",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export const Pricing = ({ onGetStarted }: PricingProps) => {
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
            Simple, <span className="text-gradient">Transparent Pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free, scale as you grow. No hidden fees.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative group"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <span className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 rounded-full text-sm font-medium glow-primary">
                    Most Popular
                  </span>
                </div>
              )}

              <div className={`glass p-8 rounded-2xl h-full relative overflow-hidden ${
                plan.popular ? 'border-2 border-primary glow-primary' : ''
              }`}>
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                  
                  <div className="flex items-baseline mb-8">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>

                  <Button
                    className={`w-full mb-8 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-primary via-secondary to-accent glow-primary'
                        : 'glass border-primary/50 hover:border-primary'
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={onGetStarted}
                  >
                    {plan.cta}
                  </Button>

                  <div className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Corner glow */}
                {plan.popular && (
                  <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary to-secondary opacity-20 rounded-full blur-3xl" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
