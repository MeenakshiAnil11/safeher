// client/src/utils/geocoding.js

/**
 * Reverse geocoding utility using Nominatim (OpenStreetMap)
 * Converts latitude and longitude to human-readable address
 */

// Cache for geocoding results to avoid repeated API calls
const geocodingCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get address details from coordinates using reverse geocoding
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object>} Address details or null if failed
 */
export const reverseGeocode = async (latitude, longitude) => {
  const cacheKey = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;

  // Check cache first
  const cached = geocodingCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'SafeHer-App/1.0 (contact@safeher.com)' // Required by Nominatim
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.display_name) {
      const addressDetails = {
        displayName: data.display_name,
        address: {
          houseNumber: data.address?.house_number || '',
          road: data.address?.road || '',
          suburb: data.address?.suburb || '',
          city: data.address?.city || data.address?.town || data.address?.village || '',
          state: data.address?.state || '',
          postcode: data.address?.postcode || '',
          country: data.address?.country || '',
          countryCode: data.address?.country_code?.toUpperCase() || ''
        },
        category: data.category || '',
        type: data.type || '',
        importance: data.importance || 0
      };

      // Cache the result
      geocodingCache.set(cacheKey, {
        data: addressDetails,
        timestamp: Date.now()
      });

      return addressDetails;
    }

    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

/**
 * Format address object into a readable string
 * @param {Object} address - Address object from reverse geocoding
 * @returns {string} Formatted address string
 */
export const formatAddress = (address) => {
  if (!address) return 'Address not available';

  const parts = [];

  // Build address from components
  if (address.houseNumber && address.road) {
    parts.push(`${address.houseNumber} ${address.road}`);
  } else if (address.road) {
    parts.push(address.road);
  }

  if (address.suburb && address.suburb !== address.city) {
    parts.push(address.suburb);
  }

  if (address.city) {
    parts.push(address.city);
  }

  if (address.state) {
    parts.push(address.state);
  }

  if (address.postcode) {
    parts.push(address.postcode);
  }

  if (address.country) {
    parts.push(address.country);
  }

  return parts.length > 0 ? parts.join(', ') : address.displayName || 'Address not available';
};

/**
 * Get a short version of the address (city, state, country)
 * @param {Object} address - Address object from reverse geocoding
 * @returns {string} Short formatted address
 */
export const formatShortAddress = (address) => {
  if (!address) return '';

  const parts = [];

  if (address.city) {
    parts.push(address.city);
  }

  if (address.state) {
    parts.push(address.state);
  }

  if (address.country) {
    parts.push(address.country);
  }

  return parts.join(', ');
};

/**
 * Clear the geocoding cache
 */
export const clearGeocodingCache = () => {
  geocodingCache.clear();
};
