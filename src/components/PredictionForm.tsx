import { useState } from "react";
import { motion } from "framer-motion";
import { PredictionInput, featureRanges } from "@/lib/cropModel";
import { Droplets, Thermometer, Cloud, FlaskConical, Leaf, Zap, CloudRain } from "lucide-react";

const icons: Record<string, React.ReactNode> = {
  N: <Leaf className="w-4 h-4" />,
  P: <Zap className="w-4 h-4" />,
  K: <FlaskConical className="w-4 h-4" />,
  temperature: <Thermometer className="w-4 h-4" />,
  humidity: <Droplets className="w-4 h-4" />,
  ph: <Cloud className="w-4 h-4" />,
  rainfall: <CloudRain className="w-4 h-4" />,
};

interface PredictionFormProps {
  onPredict: (input: PredictionInput) => void;
  loading: boolean;
}

export default function PredictionForm({ onPredict, loading }: PredictionFormProps) {
  const [values, setValues] = useState<PredictionInput>({
    N: 50, P: 50, K: 50, temperature: 25, humidity: 70, ph: 6.5, rainfall: 100,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PredictionInput, string>>>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    for (const [key, range] of Object.entries(featureRanges)) {
      const k = key as keyof PredictionInput;
      if (values[k] < range.min || values[k] > range.max) {
        newErrors[k] = `Must be ${range.min}–${range.max}`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onPredict(values);
  };

  const features = Object.entries(featureRanges) as [keyof PredictionInput, typeof featureRanges.N][];

  return (
    <motion.div
      className="glass rounded-2xl p-8 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-bold font-display text-foreground mb-2">Enter Soil & Climate Data</h2>
      <p className="text-muted-foreground mb-6">Provide your field conditions for an AI-powered crop recommendation</p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {features.map(([key, range]) => (
          <div key={key} className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span className="text-primary">{icons[key]}</span>
              {range.label}
              {range.unit && <span className="text-muted-foreground text-xs">({range.unit})</span>}
            </label>
            <input
              type="number"
              step={key === "ph" ? 0.1 : 1}
              value={values[key]}
              onChange={(e) => setValues({ ...values, [key]: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              placeholder={`${range.min} – ${range.max}`}
            />
            {errors[key] && (
              <p className="text-xs text-destructive">{errors[key]}</p>
            )}
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{range.min}</span>
              <span>{range.max}</span>
            </div>
          </div>
        ))}

        <div className="sm:col-span-2 mt-2">
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-lg font-display font-semibold text-primary-foreground transition-all disabled:opacity-60"
            style={{ background: "var(--gradient-cta)" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : (
              "🔍 Predict Best Crop"
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
