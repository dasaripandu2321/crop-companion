import { useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import PredictionForm from "@/components/PredictionForm";
import ResultCard from "@/components/ResultCard";
import ScoreCard from "@/components/ScoreCard";
import InteractiveDashboard from "@/components/InteractiveDashboard";
import ParticlesBackground from "@/components/ParticlesBackground";
import { predictCrop, PredictionInput, PredictionResult } from "@/lib/cropModel";

type View = "hero" | "form" | "result";

const Index = () => {
  const [view, setView] = useState<View>("hero");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [lastInput, setLastInput] = useState<PredictionInput | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (input: PredictionInput) => {
    setLoading(true);
    try {
      const prediction = await predictCrop(input);
      setResult(prediction);
      setLastInput(input);

      if (prediction.ai_advisory?.error) {
        toast.warning(`Model succeeded but AI advisory failed: ${prediction.ai_advisory.error}`);
      } else {
        toast.success(`${prediction.emoji} Best crop: ${prediction.crop} (${prediction.confidence}% confidence)`);
      }

      setView("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast.error("Failed to generate prediction.");
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    initial: { opacity: 0, y: 20 },
    enter: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticlesBackground />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {/* Hero View */}
          {view === "hero" && (
            <motion.div
              key="hero"
              variants={variants}
              initial="initial"
              animate="enter"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <HeroSection onStart={() => {
                setView("form");
                window.scrollTo({ top: 0, behavior: "auto" });
              }} />
            </motion.div>
          )}

          {/* Form and Result View */}
          {(view === "form" || view === "result") && (
            <motion.div
              key="form-result"
              variants={variants}
              initial="initial"
              animate="enter"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="px-4 py-16 space-y-16"
            >
              {/* Back to Home button */}
              <div className="max-w-4xl mx-auto">
                <button
                  onClick={() => {
                    setView("hero");
                    setResult(null);
                    setLastInput(null);
                    window.scrollTo({ top: 0, behavior: "auto" });
                  }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                  ← Back to Home
                </button>
              </div>

              <PredictionForm onPredict={handlePredict} loading={loading} />

              {view === "result" && result && lastInput && (
                <div className="space-y-16">
                  <ResultCard result={result} />
                  <ScoreCard result={result} input={lastInput} />
                  <InteractiveDashboard result={result} input={lastInput} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="text-center py-8 text-sm text-muted-foreground border-t border-border">
          <p className="font-display">AgroSmart © 2026 — Intelligent Crop Recommendation System</p>
          <p className="mt-1 text-xs">Powered by Gaussian Naive Bayes ML Algorithm</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
