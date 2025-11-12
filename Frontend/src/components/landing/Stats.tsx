import { motion } from "framer-motion";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

const stats = [
  { value: 10000, suffix: "+", label: "Active Users" },
  { value: 1000000, suffix: "+", label: "Workflows Executed" },
  { value: 99.9, suffix: "%", label: "Uptime" },
  { value: 18, suffix: "", label: "Pre-built Nodes" },
];

export const Stats = () => {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="glass p-6 rounded-2xl">
                <div className="text-4xl md:text-5xl font-bold mb-2 text-gradient">
                  {inView && (
                    <CountUp
                      end={stat.value}
                      duration={2.5}
                      separator={stat.value > 1000 ? "," : ""}
                      decimals={stat.value === 99.9 ? 1 : 0}
                      suffix={stat.suffix}
                    />
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
