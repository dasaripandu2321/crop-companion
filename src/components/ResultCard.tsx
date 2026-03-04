import { motion } from "framer-motion";
import { PredictionResult } from "@/lib/cropModel";
import { CropImageDisplay } from "@/components/CropImageDisplay";

interface ResultCardProps {
  result: PredictionResult;
}

const getAIExplanation = (cropName: string, probability: number): string => {
  const normalizedCropName = cropName.charAt(0).toUpperCase() + cropName.slice(1).toLowerCase();
  const highProb = probability > 70;

  const explanations: Record<string, string> = {
    Rice: highProb ? "Optimal conditions for paddy cultivation with high water availability" : "Suitable but monitor water retention",
    Wheat: highProb ? "Excellent soil fertility and temperature profile detected" : "May require supplemental irrigation",
    Bajra: highProb ? "Drought-resistant variety ideal for your dry conditions" : "Consider if water stress is expected",
    Maize: highProb ? "Balanced nutrients and temperature support high yield potential" : "May need fertilizer adjustment",
    Chilli: highProb ? "Warm climate with good soil structure detected" : "Monitor soil moisture levels",
    Cotton: highProb ? "Ideal conditions for long staple cotton production" : "Check soil drainage capacity",
  };

  return explanations[normalizedCropName] || "Based on current soil and climate parameters";
};

export default function ResultCard({ result }: ResultCardProps) {
  const topCrops = result.allProbabilities.slice(0, 5);

  return (
    <motion.div
      className="space-y-8 max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Primary Recommendation */}
      <motion.div
        className="glass rounded-2xl p-8 animate-success-glow"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <div className="text-center mb-8">
          <motion.div
            className="mb-4 flex justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <CropImageDisplay cropName={result.crop} size="lg" showLabel={false} />
          </motion.div>
          <motion.div
            className="text-5xl mb-2 animate-float"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 200 }}
          >
            {result.emoji}
          </motion.div>
          <h3 className="text-sm uppercase tracking-wider text-muted-foreground font-medium mb-1">
            Top Recommended Crop
          </h3>
          <h2 className="text-4xl font-bold font-display text-gradient">
            {result.crop}
          </h2>
          <p className="text-sm text-muted-foreground mt-3">
            {getAIExplanation(result.crop, result.confidence)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-primary/10 p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Confidence</p>
            <p className="text-3xl font-bold font-display text-primary">{result.confidence}%</p>
          </div>
          <div className="rounded-xl bg-secondary/10 p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Model Accuracy</p>
            <p className="text-3xl font-bold font-display text-secondary">{result.accuracy}%</p>
          </div>
        </div>
      </motion.div>

      {/* Top 4-5 Crop Alternatives */}
      <motion.div
        className="glass rounded-2xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h3 className="text-xl font-bold font-display mb-6">Alternative Crop Options</h3>

        <div className="space-y-4">
          {topCrops.map((crop, i) => (
            <motion.div
              key={crop.name}
              className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <div className="flex items-start gap-4">
                <CropImageDisplay cropName={crop.name} size="sm" showLabel={false} inline className="flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-foreground">
                      {i + 1}. {crop.name}
                    </h4>
                    <span className="text-lg font-bold text-primary">{crop.probability.toFixed(1)}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {getAIExplanation(crop.name, crop.probability)}
                  </p>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full"
                      style={{ background: i === 0 ? "var(--gradient-success)" : "var(--gradient-cta)" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${crop.probability}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-foreground">
            <span className="font-semibold">💡 AI Insight:</span> These recommendations are based on your soil nutrients (N, P, K), climate conditions (temperature, humidity, pH), and rainfall patterns. Choose crops that match your farming experience and market demand.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
