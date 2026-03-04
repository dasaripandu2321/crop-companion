import { motion } from "framer-motion";
import { PredictionResult, PredictionInput } from "@/lib/cropModel";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { featureRanges } from "@/lib/cropModel";

interface AnalyticsSectionProps {
  result: PredictionResult;
  input: PredictionInput;
}

export default function AnalyticsSection({ result, input }: AnalyticsSectionProps) {
  const barData = result.allProbabilities.map((crop) => ({
    name: `${crop.emoji} ${crop.name}`,
    probability: parseFloat(crop.probability.toFixed(1)),
  }));

  const radarData = (Object.entries(featureRanges) as [keyof PredictionInput, typeof featureRanges.N][]).map(
    ([key, range]) => ({
      feature: range.label.replace(/\(.*\)/, "").trim(),
      value: ((input[key] - range.min) / (range.max - range.min)) * 100,
    })
  );

  return (
    <motion.div
      className="max-w-5xl mx-auto"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-bold font-display text-foreground mb-6 text-center">
        📊 Analytics Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Crop probability chart */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Crop Probability Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(145 15% 88%)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(0 0% 100% / 0.9)",
                  border: "1px solid hsl(145 15% 88%)",
                  borderRadius: 12,
                  backdropFilter: "blur(8px)",
                }}
              />
              <Bar dataKey="probability" fill="hsl(152 56% 38%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Input radar */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Input Feature Profile</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(145 15% 88%)" />
              <PolarAngleAxis dataKey="feature" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                dataKey="value"
                stroke="hsl(207 68% 48%)"
                fill="hsl(207 68% 48%)"
                fillOpacity={0.25}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
