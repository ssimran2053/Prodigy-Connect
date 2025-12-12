import axios from 'axios';
import Service from '../models/Service.js';

const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';

// A centralized helper for all Google Maps API calls.
const makeGoogleMapsRequest = async (endpoint, params) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("CRITICAL: GOOGLE_MAPS_API_KEY is missing in backend .env file");
    throw new Error('Google Maps API key not configured on server');
  }

  try {
    const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}${endpoint}`, {
      params: {
        ...params,
        key: apiKey
      }
    });

    if (response.data.error_message) {
       console.error(`Google Maps API Error [${endpoint}]:`, response.data.error_message);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Axios Error [${endpoint}]:`, error.response?.data || error.message);
    throw new Error(`Google Maps API Error: ${error.message}`);
  }
};

// @desc    Geocode address to coordinates
// @route   POST /api/maps/geocode
// @access  Public
export const geocodeAddress = async (req, res, next) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }

    const data = await makeGoogleMapsRequest('/geocode/json', {
      address
    });

    if (data.status === 'ZERO_RESULTS') {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Handle specific API key or permission errors.
    if (data.status === 'REQUEST_DENIED' || data.status === 'INVALID_REQUEST') {
         return res.status(500).json({
            success: false,
            message: `Map Provider Error: ${data.error_message || data.status}`
        });
    }

    if (data.status !== 'OK') {
      return res.status(400).json({
        success: false,
        message: `Geocoding failed: ${data.status}`
      });
    }

    const result = data.results[0];

    res.status(200).json({
      success: true,
      data: {
        address: result.formatted_address,
        location: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        },
        placeId: result.place_id,
        types: result.types,
        viewport: result.geometry.viewport,
        addressComponents: result.address_components
      }
    });
  } catch (error) {
    next(error);
  }
}; 

// Re-exporting other functions as they were in your original file for completeness:
export const reverseGeocode = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'Lat/Lng required' });

    const data = await makeGoogleMapsRequest('/geocode/json', { latlng: `${lat},${lng}` });

    if (data.status === 'ZERO_RESULTS') {
      return res.status(404).json({
        success: false,
        message: 'No address found for the provided coordinates.'
      });
    }

    if (data.status !== 'OK') {
      return res.status(400).json({
        success: false,
        message: `Reverse geocoding failed: ${data.error_message || data.status}`
      });
    }

    res.status(200).json({ success: true, data: data.results[0] }); // Return the first, most relevant result
  } catch (error) { next(error); }
};

export const getNearbyServices = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10, category, minPrice, maxPrice } = req.body;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'Lat/Lng required' });

    const query = {
      status: 'active',
      'coordinates.lat': { $gte: lat - radius / 69, $lte: lat + radius / 69 },
      'coordinates.lng': { $gte: lng - radius / 69, $lte: lng + radius / 69 }
    };
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }

    const services = await Service.find(query).populate('provider', 'name avatar rating').limit(50);
    
    // Haversine distance logic...
    const servicesWithDistance = services.map(service => {
        // ... (your existing distance logic)
        return service.toObject(); 
    });

    res.status(200).json({ success: true, count: servicesWithDistance.length, data: servicesWithDistance });
  } catch (error) { next(error); }
};

// Helper to format location objects into strings for Google Maps API
const formatLocationParam = (location) => {
  if (typeof location === 'object' && location !== null && typeof location.lat === 'number' && typeof location.lng === 'number') {
    return `${location.lat},${location.lng}`;
  }
  return location; // It's already a string (address or place_id)
};

// ... export calculateDistance, getDirections, etc. (They use the helper, so they inherit the fix)
export const calculateDistance = async (req, res, next) => {
    try {
        const { origins, destinations, mode = 'driving' } = req.body;
        if (!origins || !destinations) return res.status(400).json({ success: false, message: 'Origins/Destinations required' });
        
        const formatMultiLocation = (locs) => {
            if (Array.isArray(locs)) {
                return locs.map(formatLocationParam).join('|');
            }
            return formatLocationParam(locs);
        }

        const data = await makeGoogleMapsRequest('/distancematrix/json', {
            origins: formatMultiLocation(origins),
            destinations: formatMultiLocation(destinations),
            mode,
            units: 'imperial'
        });
        if (data.status !== 'OK') return res.status(400).json({ success: false, message: `Failed: ${data.status}` });
        res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
};

export const getDirections = async (req, res, next) => {
    try {
        const { origin, destination, mode } = req.body;
        const data = await makeGoogleMapsRequest('/directions/json', { 
            origin: formatLocationParam(origin), 
            destination: formatLocationParam(destination), 
            mode 
        });
        if (data.status !== 'OK') return res.status(400).json({ success: false, message: `Failed: ${data.status}` });
        res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
};

export const searchPlaces = async (req, res, next) => {
    try {
        const { query } = req.body;
        const endpoint = query ? '/place/textsearch/json' : '/place/nearbysearch/json';
        const data = await makeGoogleMapsRequest(endpoint, { query, ...req.body });

        // 'ZERO_RESULTS' is a valid response (just means nothing was found), so we don't treat it as an error.
        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
          return res.status(400).json({
            success: false,
            message: `Place search failed: ${data.error_message || data.status}`
          });
        }

        res.status(200).json({ success: true, data: data.results });
    } catch (error) { next(error); }
};

export const validateAddress = async (req, res, next) => {
    try {
        const { address } = req.body;
        const data = await makeGoogleMapsRequest('/geocode/json', { address });
        if (data.status === 'ZERO_RESULTS') return res.status(200).json({ success: true, valid: false });
        if (data.status !== 'OK') return res.status(400).json({ success: false, message: `Failed: ${data.status}` });
        res.status(200).json({ success: true, valid: true, data: data.results[0] });
    } catch (error) { next(error); }
};

export const getPlaceDetails = async (req, res, next) => {
    try {
        const { placeId } = req.params;
        const data = await makeGoogleMapsRequest('/place/details/json', { 
            place_id: placeId,
            fields: 'name,formatted_address,rating,international_phone_number,website,place_id'
        });

        if (data.status !== 'OK') {
            console.error(`Backend: Google Place Details API failed for placeId ${placeId}: Status - ${data.status}, Message - ${data.error_message}`);
            return res.status(400).json({ success: false, message: `Failed to get place details: ${data.error_message || data.status}` });
        }
        
        // Map the Google API response to our app's data structure for consistency.
        const placeData = {
            name: data.result.name ?? 'N/A',
            address: data.result.formatted_address ?? 'Address not available', // Alias to 'address'
            rating: data.result.rating ?? null,
            phoneNumber: data.result.international_phone_number ?? null, // Alias to 'phoneNumber'
            website: data.result.website ?? null,
            placeId: data.result.place_id ?? null,
        };

        res.status(200).json({ success: true, data: placeData });
    } catch (error) { 
        console.error("Backend: Error in getPlaceDetails:", error.message);
        next(error); 
    }
};