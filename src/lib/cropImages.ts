/**
 * Crop image mapping for the prediction system.
 * Maps crop names (title case) to high-quality image URLs.
 * 
 * Using Unsplash for professional, high-quality crop images.
 * Images are optimized for web display with proper dimensions.
 */

export const cropImages: Record<string, string> = {
  // Main 15 crops
  Rice: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80",
  Wheat: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80",
  Maize: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&q=80",
  Cotton: "https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=800&q=80",
  Sugarcane: "https://images.unsplash.com/photo-1583484963886-cfe2bff2945f?w=800&q=80",
  Coffee: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80",
  Coconut: "https://images.unsplash.com/photo-1598511726623-d2e9996892f0?w=800&q=80",
  Jute: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80",
  Apple: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&q=80",
  Mango: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80",
  Banana: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=800&q=80",
  Lentil: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80",
  Watermelon: "https://images.unsplash.com/photo-1587049352846-4a222e784210?w=800&q=80",
  Orange: "https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=800&q=80",
  Grapes: "https://images.unsplash.com/photo-1599819177626-c0d9c3e5e6f1?w=800&q=80",
  
  // Additional crops
  Bajra: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80",
  Ragi: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80",
  Tomato: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80",
  Potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80",
  Onion: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80",
  Cabbage: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=800&q=80",
  Cauliflower: "https://images.unsplash.com/photo-1568584711271-61000e4d6901?w=800&q=80",
  Carrot: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80",
  Chilli: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80",
  Coriander: "https://images.unsplash.com/photo-1607184448550-a2b0c1b8e8c7?w=800&q=80",
  Turmeric: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80",
  Ginger: "https://images.unsplash.com/photo-1599639957043-f3aa5c986398?w=800&q=80",
};

/** Default placeholder when crop image is missing or fails to load */
export const CROP_PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80";

/**
 * Get the image URL for a crop by name.
 * Normalizes crop name (e.g., "RICE" -> "Rice") and returns the mapped image or placeholder.
 */
export function getCropImageUrl(cropName: string): string {
  const normalized = cropName.charAt(0).toUpperCase() + cropName.slice(1).toLowerCase();
  return cropImages[normalized] ?? CROP_PLACEHOLDER_IMAGE;
}
