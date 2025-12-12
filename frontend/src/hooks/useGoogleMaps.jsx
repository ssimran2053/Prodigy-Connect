import { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Create a single source of truth for the script loading status
let mapInitializationPromise = null;

const loadScript = () => {
    if (mapInitializationPromise) {
        return mapInitializationPromise;
    }

    mapInitializationPromise = new Promise((resolve, reject) => {
        // If script is already loaded
        if (window.google && window.google.maps) {
            console.log("Google Maps already loaded.");
            return resolve();
        }

        const existingScript = document.getElementById('google-maps-script');
        if (existingScript) {
             // If script is in the DOM but not loaded, wait for it
             existingScript.addEventListener('load', () => resolve());
             existingScript.addEventListener('error', (e) => reject(e));
             return;
        }

        if (!GOOGLE_MAPS_API_KEY) {
            return reject(new Error("VITE_GOOGLE_MAPS_API_KEY is not configured in .env file."));
        }

        const script = document.createElement('script');
        // Use v=beta for AdvancedMarkerElement and other new features.
        // Remove libraries from here, they will be loaded dynamically.
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=beta`;
        script.id = 'google-maps-script';
        script.async = true;
        
        script.onload = () => {
            console.log("Google Maps script loaded successfully.");
            // Wait for the importLibrary function to be available
            const checkGoogleMapsReady = () => {
                if (window.google && window.google.maps && typeof window.google.maps.importLibrary === 'function') {
                    resolve();
                } else {
                    // If not ready, check again after a short delay
                    setTimeout(checkGoogleMapsReady, 100);
                }
            };
            checkGoogleMapsReady();
        };
        
        script.onerror = (error) => {
            console.error("Error loading Google Maps script:", error);
            reject(new Error("Failed to load Google Maps script."));
        };

        document.head.appendChild(script);
    });

    return mapInitializationPromise;
};


/**
 * Custom hook for Google Maps functionality
 */
export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadScript()
        .then(() => setIsLoaded(true))
        .catch((err) => {
            setError(err.message);
            console.error(err);
        });
  }, []);

  return { isLoaded, error };
}

/**
 * Custom hook for geocoding
 */
export function useGeocoding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const geocode = useCallback(async (address) => {
    setLoading(true);
    setError(null);
    try {
      // Use searchPlaces for more flexible searching (e.g., "walmart")
      const result = await API.maps.searchPlaces(address);

      if (result.data && result.data.length > 0) {
        return result.data; // Return all results
      }

      // Fallback to geocode if search returns no results
      const geoResult = await API.maps.geocodeAddress(address);
      if (geoResult.data) {
        return [geoResult.data]; // Wrap in array for consistency
      }

      throw new Error('Address not found');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reverseGeocode = useCallback(async (lat, lng) => {
    setLoading(true);
    setError(null);
    try {
      const result = await API.maps.reverseGeocode(lat, lng);
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { geocode, reverseGeocode, loading, error };
}

/**
 * Custom hook for current location
 */
export function useCurrentLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setLocation(loc);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return { location, loading, error, refresh: getCurrentLocation };
}

/**
 * Custom hook for nearby services
 */
export function useNearbyServices(lat, lng, options = {}) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async () => {
    if (!lat || !lng) return;

    setLoading(true);
    setError(null);

    try {
      const result = await API.maps.getNearbyServices(lat, lng, options);
      setServices(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [lat, lng, options.radius, options.category]);

  useEffect(() => {
    search();
  }, [search]);

  return { services, loading, error, refresh: search };
}

/**
 * Custom hook for distance calculation
 */
export function useDistance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateDistance = useCallback(async (origin, destination, mode = 'driving') => {
    setLoading(true);
    setError(null);

    try {
      const result = await API.maps.calculateDistance(origin, destination, mode);
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { calculateDistance, loading, error };
}

/**
 * Custom hook for directions
 */
export function useDirections() {
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDirections = useCallback(async (origin, destination, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await API.maps.getDirections(origin, destination, options);
      setDirections(result.data);
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearDirections = useCallback(() => {
    setDirections(null);
    setError(null);
  }, []);

  return { directions, getDirections, clearDirections, loading, error };
}

/**
 * Custom hook for address validation
 */
export function useAddressValidation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateAddress = useCallback(async (address) => {
    setLoading(true);
    setError(null);

    try {
      const result = await API.maps.validateAddress(address);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { validateAddress, loading, error };
}

/**
 * Calculate distance using Haversine formula (client-side)
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

export default {
  useGoogleMaps,
  useGeocoding,
  useCurrentLocation,
  useNearbyServices,
  useDistance,
  useDirections,
  useAddressValidation,
  calculateHaversineDistance
};
