/**
 * Utility function to resolve product image URLs
 * Handles different URL formats and prepends backend URL when needed
 */
export const getImageUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  // If it's already a full URL (http/https), use it as is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  
  // If it's a blob URL (temporary), use it as is
  if (url.startsWith("blob:")) {
    return url;
  }
  
  // If it's a data URL (base64), use it as is
  if (url.startsWith("data:")) {
    return url;
  }

  // Frontend public assets should stay on frontend origin
  if (url.startsWith("/images/")) {
    return url;
  }
  
  // Get backend URL - extract from API base URL or use default
  // The API base URL is http://localhost:5000/api, so backend is http://localhost:5000
  let backendUrl = "http://localhost:5000";
  
  // Try to get from environment variable
  if (process.env.REACT_APP_API_URL) {
    backendUrl = process.env.REACT_APP_API_URL.replace("/api", "");
  }
  
  // If it's a relative path starting with /uploads, prepend backend URL
  if (url.startsWith("/uploads/")) {
    return `${backendUrl}${url}`;
  }
  
  // If it doesn't start with /, assume it's a relative path and prepend /uploads/
  if (!url.startsWith("/")) {
    return `${backendUrl}/uploads/${url}`;
  }
  
  // For other paths starting with /, prepend backend URL
  return `${backendUrl}${url}`;
};

/**
 * Get the main product image URL with fallback to placeholder
 */
export const getProductImage = (product, placeholder = null) => {
  const imageUrl = product?.image || product?.images?.[0]?.url || product?.images?.[0];
  const resolvedUrl = getImageUrl(imageUrl);
  
  if (resolvedUrl) {
    return resolvedUrl;
  }
  
  // Return placeholder SVG if no image
  return placeholder || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%23f3f4f6' width='300' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
};
