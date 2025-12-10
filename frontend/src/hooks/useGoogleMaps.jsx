import { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/**
 * Custom hook for Google Maps functionality
 */
export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API key not configured');
      return;
    }

    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[src^="https://maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      const handleLoad = () => setIsLoaded(true);
      existingScript.addEventListener('load', handleLoad);
      return () => existingScript.removeEventListener('load', handleLoad);
    }

    const script = document.createElement('script');
    // ADDED: &loading=async callback=initMap
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async&v=weekly`;
    script.async = true;
    script.defer = true;
    script.id = 'google-maps-script';

    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError('Failed to load Google Maps');

    document.head.appendChild(script);
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
      const result = await API.maps.geocodeAddress(address);
      return result.data;
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
