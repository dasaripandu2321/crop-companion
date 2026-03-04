/**
 * Example: How to use CropImageDisplay in a prediction result page
 *
 * This file demonstrates integration with a crop prediction result.
 * It is not imported anywhere—use it as a reference.
 */

import CropImageDisplay from "@/components/CropImageDisplay";

// ─────────────────────────────────────────────────────────────────────────────
// Example 1: Simple prediction result display
// ─────────────────────────────────────────────────────────────────────────────

function PredictionResultExample({ predictedCrop }: { predictedCrop: string }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-bold">Predicted Crop</h2>
      <CropImageDisplay cropName={predictedCrop} size="lg" showLabel />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Example 2: Full prediction page layout
// ─────────────────────────────────────────────────────────────────────────────

interface PredictionResult {
  crop: string;
  confidence: number;
  emoji: string;
}

function PredictionResultPage({ result }: { result: PredictionResult }) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Crop Recommendation</h1>

      <div className="rounded-xl border bg-card p-8 shadow-md">
        <p className="mb-4 text-sm text-muted-foreground">
          Based on your soil and climate data
        </p>

        {/* Predicted crop name */}
        <h2 className="mb-2 text-3xl font-bold">{result.crop}</h2>

        {/* Crop image from CropImageDisplay */}
        <CropImageDisplay
          cropName={result.crop}
          size="lg"
          showLabel={false}
          className="mb-4"
        />

        <p className="text-sm text-muted-foreground">
          Confidence: {result.confidence}%
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Example 3: Alternative crops list (thumbnails)
// ─────────────────────────────────────────────────────────────────────────────

function AlternativeCropsExample({
  crops,
}: {
  crops: { name: string; probability: number }[];
}) {
  return (
    <div className="space-y-3">
      {crops.map((crop, i) => (
        <div
          key={crop.name}
          className="flex items-center gap-4 rounded-lg border p-4"
        >
          <CropImageDisplay
            cropName={crop.name}
            size="sm"
            showLabel={false}
            inline
            className="flex-shrink-0"
          />
          <div>
            <p className="font-semibold">
              {i + 1}. {crop.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {crop.probability.toFixed(1)}%
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
