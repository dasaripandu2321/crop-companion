import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PredictionResult, PredictionInput, featureRanges } from "@/lib/cropModel";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { BarChart3, Activity, PieChartIcon, TrendingUp, Bot, AlertTriangle } from "lucide-react";

interface InteractiveDashboardProps {
  result: PredictionResult;
  input: PredictionInput;
}

const TABS = [
  { id: "probability", label: "Crop Probabilities", icon: <BarChart3 className="w-4 h-4" /> },
  { id: "advisory", label: "AI Advisory (Gemini)", icon: <Bot className="w-4 h-4" /> },
  { id: "profile", label: "Input Profile", icon: <Activity className="w-4 h-4" /> },
  { id: "distribution", label: "Distribution", icon: <PieChartIcon className="w-4 h-4" /> },
  { id: "comparison", label: "Feature Comparison", icon: <TrendingUp className="w-4 h-4" /> },
] as const;

type TabId = typeof TABS[number]["id"];

const PIE_COLORS = [
  "hsl(152, 56%, 38%)", "hsl(207, 68%, 48%)", "hsl(85, 60%, 50%)",
  "hsl(32, 80%, 55%)", "hsl(340, 65%, 55%)",
];

export default function InteractiveDashboard({ result, input }: InteractiveDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("probability");

  const barData = result.allProbabilities.map((crop) => ({
    name: `${crop.emoji} ${crop.name}`,
    probability: parseFloat(crop.probability.toFixed(1)),
  }));

  const radarData = (Object.entries(featureRanges) as [keyof PredictionInput, typeof featureRanges.N][]).map(
    ([key, range]) => ({
      feature: range.label.replace(/\(.*\)/, "").trim(),
      value: Math.round(((input[key] - range.min) / (range.max - range.min)) * 100),
      fullMark: 100,
    })
  );

  const pieData = result.allProbabilities.map((crop) => ({
    name: crop.name,
    value: parseFloat(crop.probability.toFixed(1)),
    emoji: crop.emoji,
  }));

  // Feature comparison: input vs optimal for predicted crop
  const comparisonData = (Object.entries(featureRanges) as [keyof PredictionInput, typeof featureRanges.N][]).map(
    ([key, range]) => ({
      feature: range.label.replace(/\(.*\)/, "").trim(),
      yours: input[key],
      optimalLow: range.min + (range.max - range.min) * 0.3,
      optimalHigh: range.min + (range.max - range.min) * 0.7,
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
        📊 Interactive Dashboard
      </h2>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-lg"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className="glass rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "probability" && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Probability of each crop based on your inputs
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(145 15% 88%)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Probability"]}
                    contentStyle={{
                      background: "hsl(0 0% 100% / 0.95)",
                      border: "1px solid hsl(145 15% 88%)",
                      borderRadius: 12,
                      backdropFilter: "blur(8px)",
                    }}
                  />
                  <Bar dataKey="probability" radius={[0, 8, 8, 0]}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === "profile" && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Your input values normalized to 0–100% scale
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="hsl(145 15% 88%)" />
                  <PolarAngleAxis dataKey="feature" tick={{ fontSize: 11, fill: "hsl(160 10% 42%)" }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    dataKey="value"
                    stroke="hsl(152, 56%, 38%)"
                    fill="hsl(152, 56%, 38%)"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === "distribution" && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Crop probability distribution
              </h3>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                      animationBegin={200}
                      animationDuration={800}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, _: string, entry: any) => [
                        `${value}%`,
                        `${entry.payload.emoji} ${entry.payload.name}`,
                      ]}
                      contentStyle={{
                        background: "hsl(0 0% 100% / 0.95)",
                        border: "1px solid hsl(145 15% 88%)",
                        borderRadius: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="space-y-2 min-w-[140px]">
                  {pieData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-foreground">{item.emoji} {item.name}</span>
                      <span className="text-muted-foreground ml-auto">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "comparison" && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Your input values across all features
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(145 15% 88%)" />
                  <XAxis dataKey="feature" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(0 0% 100% / 0.95)",
                      border: "1px solid hsl(145 15% 88%)",
                      borderRadius: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="optimalHigh"
                    stroke="none"
                    fill="hsl(152, 56%, 38%)"
                    fillOpacity={0.08}
                    name="Optimal High"
                  />
                  <Area
                    type="monotone"
                    dataKey="optimalLow"
                    stroke="none"
                    fill="hsl(0, 0%, 100%)"
                    fillOpacity={1}
                    name="Optimal Low"
                  />
                  <Area
                    type="monotone"
                    dataKey="yours"
                    stroke="hsl(207, 68%, 48%)"
                    fill="hsl(207, 68%, 48%)"
                    fillOpacity={0.15}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "hsl(207, 68%, 48%)" }}
                    name="Your Values"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Green shaded area = optimal range · Blue line = your input values
              </p>
            </div>
          )}
          {activeTab === "advisory" && (
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-primary flex items-center gap-2">
                  <Bot className="w-5 h-5" /> Gemini Integrated Intelligence
                </h3>
              </div>

              {!result.ai_advisory || result.ai_advisory.error ? (
                <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                  <AlertTriangle className="w-5 h-5" />
                  <p className="text-sm">
                    {result.ai_advisory?.error || "AI Advisory data is currently unavailable."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass-panel p-4 rounded-xl border border-border/50 bg-background/50">
                    <h4 className="font-semibold text-foreground mb-1 text-sm flex items-center gap-2">🔬 Technical Explanation</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{result.ai_advisory.technical_explanation}</p>
                  </div>
                  <div className="glass-panel p-4 rounded-xl border border-border/50 bg-background/50">
                    <h4 className="font-semibold text-foreground mb-1 text-sm flex items-center gap-2">🧪 Fertilizer Plan</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{result.ai_advisory.fertilizer_plan}</p>
                  </div>
                  <div className="glass-panel p-4 rounded-xl border border-border/50 bg-background/50">
                    <h4 className="font-semibold text-foreground mb-1 text-sm flex items-center gap-2">💧 Irrigation Strategy</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{result.ai_advisory.irrigation_strategy}</p>
                  </div>
                  <div className="glass-panel p-4 rounded-xl border border-border/50 bg-background/50">
                    <h4 className="font-semibold text-foreground mb-1 text-sm flex items-center gap-2">🛡️ Pest Prevention</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{result.ai_advisory.pest_prevention}</p>
                  </div>
                  <div className="glass-panel p-4 rounded-xl border border-border/50 bg-background/50">
                    <h4 className="font-semibold text-foreground mb-1 text-sm flex items-center gap-2">📈 Yield Optimization</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{result.ai_advisory.yield_optimization}</p>
                  </div>
                  <div className="glass-panel p-4 rounded-xl border border-border/50 bg-background/50">
                    <h4 className="font-semibold text-foreground mb-1 text-sm flex items-center gap-2">🌦️ Seasonal Advice</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{result.ai_advisory.seasonal_advice}</p>
                  </div>
                  <div className="glass-panel p-4 rounded-xl border border-border/50 bg-background/50">
                    <h4 className="font-semibold text-foreground mb-1 text-sm flex items-center gap-2">💰 Market Insight</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{result.ai_advisory.market_insight}</p>
                  </div>
                  <div className="glass-panel p-4 rounded-xl border border-border/50 bg-background/50">
                    <h4 className="font-semibold text-foreground mb-1 text-sm flex items-center gap-2">🏛️ Govt Schemes (India)</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{result.ai_advisory.government_schemes}</p>
                  </div>

                  {/* Multilingual Summaries */}
                  <div className="md:col-span-2 glass-panel p-4 rounded-xl border border-primary/20 bg-primary/5 mt-2">
                    <h4 className="font-semibold text-primary mb-3 text-sm flex items-center gap-2">🌍 Regional Summaries</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {result.ai_advisory.summaries && Object.entries(result.ai_advisory.summaries).map(([lang, text]) => (
                        <div key={lang} className="bg-background/80 p-3 rounded-lg border border-border">
                          <h5 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">{lang}</h5>
                          <p className="text-xs text-foreground">{String(text)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
