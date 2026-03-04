// Crop prediction engine using rule-based Gaussian Naive Bayes approximation
// Based on typical crop requirements from agricultural datasets

import { API_URL } from './config';

interface CropProfile {
  name: string;
  emoji: string;
  N: [number, number]; // [mean, std]
  P: [number, number];
  K: [number, number];
  temperature: [number, number];
  humidity: [number, number];
  ph: [number, number];
  rainfall: [number, number];
}

const cropProfiles: CropProfile[] = [
  { name: "Rice", emoji: "🌾", N: [80, 15], P: [48, 12], K: [40, 10], temperature: [24, 3], humidity: [82, 5], ph: [6.5, 0.5], rainfall: [230, 40] },
  { name: "Wheat", emoji: "🌿", N: [75, 15], P: [55, 15], K: [45, 12], temperature: [22, 4], humidity: [65, 8], ph: [6.8, 0.4], rainfall: [90, 20] },
  { name: "Maize", emoji: "🌽", N: [80, 12], P: [45, 10], K: [30, 8], temperature: [23, 3], humidity: [65, 8], ph: [6.2, 0.5], rainfall: [85, 15] },
  { name: "Cotton", emoji: "☁️", N: [120, 15], P: [45, 10], K: [20, 5], temperature: [25, 3], humidity: [60, 8], ph: [7.0, 0.5], rainfall: [80, 15] },
  { name: "Sugarcane", emoji: "🎋", N: [100, 15], P: [25, 8], K: [50, 10], temperature: [27, 3], humidity: [80, 5], ph: [6.5, 0.5], rainfall: [175, 30] },
  { name: "Coffee", emoji: "☕", N: [100, 15], P: [20, 5], K: [30, 8], temperature: [25, 3], humidity: [58, 8], ph: [6.5, 0.5], rainfall: [150, 25] },
  { name: "Coconut", emoji: "🥥", N: [22, 8], P: [17, 5], K: [30, 8], temperature: [27, 2], humidity: [95, 3], ph: [5.8, 0.5], rainfall: [150, 25] },
  { name: "Jute", emoji: "🧵", N: [80, 12], P: [45, 10], K: [40, 8], temperature: [25, 2], humidity: [80, 5], ph: [6.7, 0.4], rainfall: [175, 25] },
  { name: "Apple", emoji: "🍎", N: [20, 5], P: [130, 15], K: [200, 10], temperature: [23, 3], humidity: [92, 3], ph: [6.0, 0.5], rainfall: [110, 15] },
  { name: "Mango", emoji: "🥭", N: [20, 5], P: [18, 5], K: [30, 8], temperature: [31, 3], humidity: [50, 5], ph: [5.8, 0.5], rainfall: [95, 15] },
  { name: "Banana", emoji: "🍌", N: [100, 10], P: [75, 10], K: [50, 8], temperature: [27, 2], humidity: [80, 5], ph: [6.0, 0.5], rainfall: [105, 15] },
  { name: "Lentil", emoji: "🫘", N: [20, 5], P: [60, 10], K: [20, 5], temperature: [24, 3], humidity: [65, 8], ph: [7.0, 0.5], rainfall: [45, 10] },
  { name: "Watermelon", emoji: "🍉", N: [100, 10], P: [18, 5], K: [50, 8], temperature: [26, 2], humidity: [85, 3], ph: [6.5, 0.5], rainfall: [50, 10] },
  { name: "Orange", emoji: "🍊", N: [20, 5], P: [10, 3], K: [10, 3], temperature: [23, 3], humidity: [92, 3], ph: [7.0, 0.5], rainfall: [110, 15] },
  { name: "Grapes", emoji: "🍇", N: [25, 8], P: [125, 15], K: [200, 10], temperature: [24, 3], humidity: [82, 5], ph: [6.0, 0.5], rainfall: [70, 15] },
];

function gaussianProbability(x: number, mean: number, std: number): number {
  const exponent = -0.5 * ((x - mean) / std) ** 2;
  return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
}

export interface PredictionInput {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

export interface PredictionResult {
  crop: string;
  emoji: string;
  confidence: number;
  accuracy: number;
  allProbabilities: { name: string; emoji: string; probability: number }[];
  ai_advisory?: any; // New field from Gemini API
}

export async function predictCrop(input: PredictionInput): Promise<PredictionResult> {
  try {
    const response = await fetch(`${API_URL}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch prediction from backend, falling back to basic mock response.", error);
    // Simple mock fallback just in case backend is unreachable
    return {
      crop: "Rice",
      emoji: "🌾",
      confidence: 90.0,
      accuracy: 94.5,
      allProbabilities: [
        { name: "Rice", emoji: "🌾", probability: 90 },
        { name: "Wheat", emoji: "🌿", probability: 5 },
        { name: "Maize", emoji: "🌽", probability: 5 }
      ],
      ai_advisory: {
        "technical_explanation": "Fallback due to connection error.",
        "fertilizer_plan": "N/A",
        "irrigation_strategy": "N/A",
        "pest_prevention": "N/A",
        "yield_optimization": "N/A",
        "seasonal_advice": "N/A",
        "market_insight": "N/A",
        "government_schemes": "N/A",
        "summaries": { "english": "API Unreachable", "hindi": "", "tamil": "", "telugu": "", "kannada": "" }
      }
    };
  }
}

export const featureRanges = {
  N: { min: 0, max: 140, unit: "kg/ha", label: "Nitrogen (N)" },
  P: { min: 5, max: 145, unit: "kg/ha", label: "Phosphorus (P)" },
  K: { min: 5, max: 205, unit: "kg/ha", label: "Potassium (K)" },
  temperature: { min: 8, max: 44, unit: "°C", label: "Temperature" },
  humidity: { min: 14, max: 100, unit: "%", label: "Humidity" },
  ph: { min: 3.5, max: 9.9, unit: "", label: "pH Level" },
  rainfall: { min: 20, max: 300, unit: "mm", label: "Rainfall" },
};
