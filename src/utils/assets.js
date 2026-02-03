// Helper to get the correct base URL for public assets
// Handles both development and production (GitHub Pages subdirectory) environments
export const getAssetUrl = (path) => {
  const base = import.meta.env.BASE_URL || '/'
  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${base}${cleanPath}`
}
