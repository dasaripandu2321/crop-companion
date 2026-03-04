/**
 * Application Configuration
 * 
 * Environment-specific settings for the application
 */

// API Base URL - automatically switches between development and production
export const API_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL || 'https://crop-companion-backend.onrender.com'  // Production URL (UPDATE THIS!)
  : 'http://localhost:5000';  // Development URL

// Firebase is configured in src/lib/firebase.ts

// Export for easy access
export const config = {
  apiUrl: API_URL,
  isDevelopment: !import.meta.env.PROD,
  isProduction: import.meta.env.PROD,
};

export default config;
