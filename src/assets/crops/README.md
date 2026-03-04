# Crop Images

Place crop image files here (e.g., `rice.jpg`, `wheat.jpg`) if you want to use local assets instead of CDN URLs.

To switch to local images, update `src/lib/cropImages.ts`:

```ts
import riceImg from '@/assets/crops/rice.jpg';
import wheatImg from '@/assets/crops/wheat.jpg';
// ... etc

export const cropImages: Record<string, string> = {
  Rice: riceImg,
  Wheat: wheatImg,
  // ...
};
```

Supported crops: Rice, Wheat, Maize, Cotton, Sugarcane, Coffee, Coconut, Jute, Apple, Mango, Banana, Lentil, Watermelon, Orange, Grapes.
