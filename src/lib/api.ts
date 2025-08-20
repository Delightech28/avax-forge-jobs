// Get the API base URL from environment variables
// In development, this will be empty (using proxy)
// In production, this should be your Render backend URL
export const API_BASE: string = (import.meta as any).env?.VITE_API_URL || 'https://avax-forge-jobs-api.onrender.com';

// Debug: Log all environment variables
console.log('Environment check:', {
  VITE_API_URL: (import.meta as any).env?.VITE_API_URL,
  API_BASE,
  NODE_ENV: (import.meta as any).env?.MODE || 'unknown'
});

// For production, you need to set VITE_API_URL to your Render backend URL
// Example: https://your-app-name.onrender.com
export const api = (path: string): string => {
  const fullUrl = `${API_BASE}${path}`;
  console.log('API call:', { path, API_BASE, fullUrl });
  return fullUrl;
};

// Helper function to get full API URL
export const getApiUrl = (path: string): string => {
  if (!API_BASE) {
    console.warn('VITE_API_URL is not set. Make sure to set it in your production environment.');
  }
  return `${API_BASE}${path}`;
};


