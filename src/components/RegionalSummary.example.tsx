/**
 * Example: How to use RegionalSummary component
 * 
 * This demonstrates integration with crop prediction results
 * to show region-specific insights and recommendations.
 */

import { useState } from "react";
import { RegionalSummary } from "@/components/RegionalSummary";
import { RegionSelector } from "@/components/RegionSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// ─────────────────────────────────────────────────────────────────────────────
// Example 1: Simple regional summary after prediction
// ─────────────────────────────────────────────────────────────────────────────

interface PredictionResult {
  crop: string;
  confidence: number;
  soilData: {
    N: number;
    P: number;
    K: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
  };
}

function SimplePredictionWithRegion({ result }: { result: PredictionResult }) {
  const [selectedRegion, setSelectedRegion] = useState("Punjab");

  return (
    <div className="space-y-6">
      {/* Prediction Result */}
      <Card>
        <CardHeader>
          <CardTitle>Predicted Crop: {result.crop}</CardTitle>
          <CardDescription>Confidence: {result.confidence}%</CardDescription>
        </CardHeader>
      </Card>

      {/* Region Selector */}
      <RegionSelector value={selectedRegion} onChange={setSelectedRegion} />

      {/* Regional Summary */}
      <RegionalSummary
        region={selectedRegion}
        crop={result.crop}
        soilData={result.soilData}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Example 2: Full prediction page with regional insights
// ─────────────────────────────────────────────────────────────────────────────

function FullPredictionPage() {
  const [region, setRegion] = useState("Maharashtra");
  const [showRegionalInsights, setShowRegionalInsights] = useState(false);

  // Mock prediction result
  const predictionResult = {
    crop: "Cotton",
    confidence: 87.5,
    soilData: {
      N: 100,
      P: 50,
      K: 80,
      temperature: 25,
      humidity: 65,
      ph: 6.8,
      rainfall: 90,
    },
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-3xl font-bold">Crop Recommendation System</h1>

      {/* Main Prediction Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{predictionResult.crop}</CardTitle>
          <CardDescription>
            Recommended crop based on your soil and climate data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Confidence Score:</span>
              <span className="text-2xl font-bold text-green-600">
                {predictionResult.confidence}%
              </span>
            </div>

            {/* Region Selection */}
            <div className="pt-4 border-t">
              <RegionSelector value={region} onChange={setRegion} />
            </div>

            {/* Toggle Regional Insights */}
            <Button
              onClick={() => setShowRegionalInsights(!showRegionalInsights)}
              className="w-full"
              variant={showRegionalInsights ? "secondary" : "default"}
            >
              {showRegionalInsights ? "Hide" : "Show"} Regional Insights
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Regional Summary (conditionally shown) */}
      {showRegionalInsights && (
        <RegionalSummary
          region={region}
          crop={predictionResult.crop}
          soilData={predictionResult.soilData}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Example 3: Compare multiple regions
// ─────────────────────────────────────────────────────────────────────────────

function RegionalComparison() {
  const [regions, setRegions] = useState(["Punjab", "Maharashtra"]);
  const crop = "Wheat";
  const soilData = {
    N: 75,
    P: 55,
    K: 45,
    temperature: 22,
    humidity: 65,
    ph: 6.8,
    rainfall: 90,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Compare {crop} Suitability Across Regions</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {regions.map((region) => (
          <div key={region} className="space-y-4">
            <h3 className="text-xl font-semibold">{region}</h3>
            <RegionalSummary region={region} crop={crop} soilData={soilData} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Example 4: Integration with prediction form
// ─────────────────────────────────────────────────────────────────────────────

function PredictionFormWithRegion() {
  const [formData, setFormData] = useState({
    N: 80,
    P: 48,
    K: 40,
    temperature: 24,
    humidity: 82,
    ph: 6.5,
    rainfall: 230,
    region: "Tamil Nadu",
  });
  const [prediction, setPrediction] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Call prediction API
    const response = await fetch("http://localhost:5000/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    
    const result = await response.json();
    setPrediction(result.crop);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Enter Your Farm Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Form fields for N, P, K, etc. */}
            <RegionSelector
              value={formData.region}
              onChange={(region) => setFormData({ ...formData, region })}
            />
            <Button type="submit" className="w-full">
              Get Recommendation
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* Show results with regional insights */}
      {prediction && (
        <RegionalSummary
          region={formData.region}
          crop={prediction}
          soilData={formData}
        />
      )}
    </div>
  );
}

export {
  SimplePredictionWithRegion,
  FullPredictionPage,
  RegionalComparison,
  PredictionFormWithRegion,
};
