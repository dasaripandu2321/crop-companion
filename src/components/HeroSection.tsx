import { motion } from "framer-motion";
import heroFarm from "@/assets/hero-farm.jpg";

interface HeroSectionProps {
  onStart: () => void;
}

export default function HeroSection({ onStart }: HeroSectionProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroFarm}
          alt="Agricultural farmland at golden hour"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-background" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-primary/20 text-primary-foreground border border-primary/30 mb-6 backdrop-blur-sm">
            🌾 Powered by Machine Learning
          </span>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-bold font-display text-primary-foreground mb-6 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          Agro<span className="text-accent">Smart</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          AI-Powered Crop Recommendation System using Gaussian Naive Bayes. 
          Get instant, data-driven insights on the best crop for your soil and climate conditions.
        </motion.p>

        <motion.button
          onClick={onStart}
          className="px-8 py-4 rounded-lg font-display font-semibold text-lg text-primary-foreground shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
          style={{ background: "var(--gradient-cta)" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          🚀 Start Prediction
        </motion.button>
      </div>
    </section>
  );
}
