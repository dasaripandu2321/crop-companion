/**
 * Example: Using local crop images instead of CDN URLs
 * 
 * Instructions:
 * 1. Place crop images in src/assets/crops/ folder
 * 2. Name them: rice.jpg, wheat.jpg, maize.jpg, etc.
 * 3. Replace the content of cropImages.ts with this file
 */

// Import local images
import riceImg from '@/assets/crops/rice.jpg';
import wheatImg from '@/assets/crops/wheat.jpg';
import maizeImg from '@/assets/crops/maize.jpg';
import cottonImg from '@/assets/crops/cotton.jpg';
import sugarcaneImg from '@/assets/crops/sugarcane.jpg';
import coffeeImg from '@/assets/crops/coffee.jpg';
import coconutImg from '@/assets/crops/coconut.jpg';
import juteImg from '@/assets/crops/jute.jpg';
import appleImg from '@/assets/crops/apple.jpg';
import mangoImg from '@/assets/crops/mango.jpg';
import bananaImg from '@/assets/crops/banana.jpg';
import lentilImg from '@/assets/crops/lentil.jpg';
import watermelonImg from '@/assets/crops/watermelon.jpg';
import orangeImg from '@/assets/crops/orange.jpg';
import grapesImg from '@/assets/crops/grapes.jpg';
import placeholderImg from '@/assets/crops/placeholder.jpg';

export const cropImages: Record<string, string> = {
  Rice: riceImg,
  Wheat: wheatImg,
  Maize: maizeImg,
  Cotton: cottonImg,
  Sugarcane: sugarcaneImg,
  Coffee: coffeeImg,
  Coconut: coconutImg,
  Jute: juteImg,
  Apple: appleImg,
  Mango: mangoImg,
  Banana: bananaImg,
  Lentil: lentilImg,
  Watermelon: watermelonImg,
  Orange: orangeImg,
  Grapes: grapesImg,
};

export const CROP_PLACEHOLDER_IMAGE = placeholderImg;

export function getCropImageUrl(cropName: string): string {
  const normalized = cropName.charAt(0).toUpperCase() + cropName.slice(1).toLowerCase();
  return cropImages[normalized] ?? CROP_PLACEHOLDER_IMAGE;
}
