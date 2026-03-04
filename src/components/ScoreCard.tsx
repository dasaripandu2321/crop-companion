import { motion } from "framer-motion";
import { PredictionResult, PredictionInput, featureRanges } from "@/lib/cropModel";
import { TrendingUp, Droplets, Thermometer, Leaf, Zap, FlaskConical, CloudRain, Cloud, Award, Target, BarChart3, ShieldCheck } from "lucide-react";

interface ScoreCardProps {
  result: PredictionResult;
  input: PredictionInput;
}

function AnimatedGauge({ value, label, color, delay = 0 }: { value: number; label: string; color: string; delay?: number }) {
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, type: "spring" }}
    >
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r="54" fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ delay: delay + 0.3, duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-2xl font-bold font-display text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.8 }}
          >
            {value}%
          </motion.span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground mt-2 text-center">{label}</span>
    </motion.div>
  );
}

function SoilHealthBar({ label, value, optimal, icon, delay }: { label: string; value: number; optimal: [number, number]; icon: React.ReactNode; delay: number }) {
  const isInRange = value >= optimal[0] && value <= optimal[1];
  const score = isInRange ? 100 : Math.max(0, 100 - Math.abs(value - (optimal[0] + optimal[1]) / 2) * 2);

  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <span className="text-primary">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-foreground truncate">{label}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{value}</span>
            {isInRange ? (
              <ShieldCheck className="w-3 h-3 text-primary" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-destructive/60" />
            )}
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: isInRange ? "var(--gradient-success)" : "hsl(var(--destructive))" }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(score, 100)}%` }}
            transition={{ delay: delay + 0.2, duration: 0.6 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Crop growing tips data
const cropDetails: Record<string, { season: string; water: string; soil: string; duration: string; tips: string[] }> = {
  Rice: { season: "Kharif (Jun–Nov)", water: "High", soil: "Clayey / Alluvial", duration: "120–150 days", tips: ["Requires standing water", "Transplanting gives best yield", "Apply zinc sulfate at tillering"] },
  Wheat: { season: "Rabi (Nov–Apr)", water: "Moderate", soil: "Loamy / Clay Loam", duration: "110–130 days", tips: ["Sow after first winter rain", "3–4 irrigations needed", "Apply urea at crown root stage"] },
  Maize: { season: "Kharif / Rabi", water: "Moderate", soil: "Well-drained loamy", duration: "80–110 days", tips: ["Good drainage essential", "Earthing up at knee-high stage", "Susceptible to stem borer"] },
  Cotton: { season: "Kharif (Apr–Oct)", water: "Moderate", soil: "Black / Alluvial", duration: "150–180 days", tips: ["Bt cotton preferred", "Avoid waterlogging", "Pick bolls when fully open"] },
  Sugarcane: { season: "Year-round", water: "Very High", soil: "Loamy / Clay Loam", duration: "12–18 months", tips: ["Trench planting recommended", "Earthing up critical", "Ratoon crop saves cost"] },
  Coffee: { season: "Year-round", water: "Moderate", soil: "Well-drained, rich in humus", duration: "3–4 years to first harvest", tips: ["Shade-grown preferred", "Needs altitude 600–1600m", "Prune regularly for yield"] },
  Coconut: { season: "Year-round", water: "High", soil: "Sandy / Laterite", duration: "6–10 years to full yield", tips: ["Salt-tolerant crop", "Basin irrigation effective", "Apply sea salt around base"] },
  Jute: { season: "Kharif (Mar–Aug)", water: "High", soil: "Alluvial / Loamy", duration: "100–120 days", tips: ["Retting needed post-harvest", "Warm humid climate essential", "Harvest at flowering stage"] },
  Apple: { season: "Temperate (Jun–Oct)", water: "Moderate", soil: "Well-drained loamy", duration: "4–8 years to fruit", tips: ["Chilling hours critical", "Cross-pollination needed", "Prune annually for shape"] },
  Mango: { season: "Summer (Mar–Jun)", water: "Low–Moderate", soil: "Deep well-drained", duration: "5–8 years to fruit", tips: ["Avoid excessive nitrogen", "Paclobutrazol for flowering", "Protect from fruit fly"] },
  Banana: { season: "Year-round", water: "Very High", soil: "Rich loamy / Alluvial", duration: "10–15 months", tips: ["Tissue culture plants preferred", "Propping needed at fruiting", "Susceptible to Panama wilt"] },
  Lentil: { season: "Rabi (Oct–Mar)", water: "Low", soil: "Sandy / Loamy", duration: "90–120 days", tips: ["Drought-tolerant crop", "Inoculate with Rhizobium", "Minimal tillage works well"] },
  Watermelon: { season: "Summer (Feb–May)", water: "Moderate", soil: "Sandy / Well-drained", duration: "80–110 days", tips: ["Needs warm soil to germinate", "Mulching conserves moisture", "Harvest when tendril dries"] },
  Orange: { season: "Year-round", water: "Moderate", soil: "Well-drained loamy", duration: "3–5 years to fruit", tips: ["Grafted plants faster fruiting", "Micronutrient spray important", "Pruning after harvest"] },
  Grapes: { season: "Summer (Dec–May)", water: "Moderate", soil: "Well-drained sandy loam", duration: "2–3 years to fruit", tips: ["Trellising essential", "Pruning determines yield", "Bag bunches to prevent damage"] },
};

export default function ScoreCard({ result, input }: ScoreCardProps) {
  const normalizedCropName = result.crop.charAt(0).toUpperCase() + result.crop.slice(1).toLowerCase();
  const details = cropDetails[normalizedCropName] || cropDetails["Rice"];

  // Calculate soil health scores
  const optimalRanges: Record<string, [number, number]> = {
    N: [40, 120], P: [15, 80], K: [15, 100],
    temperature: [18, 35], humidity: [40, 90], ph: [5.5, 7.5], rainfall: [40, 250],
  };

  const soilParams = [
    { key: "N", label: "Nitrogen", icon: <Leaf className="w-4 h-4" /> },
    { key: "P", label: "Phosphorus", icon: <Zap className="w-4 h-4" /> },
    { key: "K", label: "Potassium", icon: <FlaskConical className="w-4 h-4" /> },
    { key: "ph", label: "pH Level", icon: <Cloud className="w-4 h-4" /> },
    { key: "temperature", label: "Temperature", icon: <Thermometer className="w-4 h-4" /> },
    { key: "humidity", label: "Humidity", icon: <Droplets className="w-4 h-4" /> },
    { key: "rainfall", label: "Rainfall", icon: <CloudRain className="w-4 h-4" /> },
  ];

  // Overall soil health
  const healthScores = soilParams.map(p => {
    const v = input[p.key as keyof PredictionInput];
    const [lo, hi] = optimalRanges[p.key];
    return v >= lo && v <= hi ? 100 : Math.max(0, 100 - Math.abs(v - (lo + hi) / 2) * 1.5);
  });
  const overallHealth = Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length);

  // Suitability score (based on how well inputs match the predicted crop)
  const suitability = Math.min(99, Math.round(result.confidence * 1.05));

  return (
    <motion.div
      className="max-w-5xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Section Header */}
      <div className="text-center">
        <motion.h2
          className="text-2xl font-bold font-display text-foreground flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Award className="w-6 h-6 text-primary" />
          Crop Scorecard
        </motion.h2>
        <p className="text-sm text-muted-foreground mt-1">Comprehensive analysis of your prediction</p>
      </div>

      {/* Gauges Row */}
      <div className="glass rounded-2xl p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <AnimatedGauge value={result.confidence > 99 ? 99 : Math.round(result.confidence)} label="Prediction Confidence" color="hsl(152, 56%, 38%)" delay={0} />
          <AnimatedGauge value={suitability} label="Crop Suitability" color="hsl(207, 68%, 48%)" delay={0.15} />
          <AnimatedGauge value={overallHealth} label="Soil Health Index" color="hsl(85, 60%, 50%)" delay={0.3} />
          <AnimatedGauge value={Math.round(result.accuracy)} label="Model Accuracy" color="hsl(32, 80%, 55%)" delay={0.45} />
        </div>
      </div>

      {/* Two-column: Soil Health + Crop Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Soil Health Breakdown */}
        <motion.div
          className="glass rounded-2xl p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Soil & Climate Health
          </h3>
          <div className="space-y-3">
            {soilParams.map((p, i) => (
              <SoilHealthBar
                key={p.key}
                label={p.label}
                value={input[p.key as keyof PredictionInput]}
                optimal={optimalRanges[p.key] as [number, number]}
                icon={p.icon}
                delay={0.4 + i * 0.08}
              />
            ))}
          </div>
        </motion.div>

        {/* Crop Details Card */}
        <motion.div
          className="glass rounded-2xl p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-secondary" />
            {result.emoji} {result.crop} — Growing Guide
          </h3>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: "Season", value: details.season },
              { label: "Water Need", value: details.water },
              { label: "Soil Type", value: details.soil },
              { label: "Duration", value: details.duration },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                className="rounded-xl bg-muted/60 p-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{item.label}</p>
                <p className="text-xs font-semibold text-foreground leading-tight">{item.value}</p>
              </motion.div>
            ))}
          </div>

          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Pro Tips
          </h4>
          <ul className="space-y-1.5">
            {details.tips.map((tip, i) => (
              <motion.li
                key={i}
                className="text-xs text-foreground flex items-start gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                <span className="text-primary mt-0.5">•</span>
                {tip}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}
