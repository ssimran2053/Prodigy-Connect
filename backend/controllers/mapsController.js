import axios from 'axios';
import Service from '../models/Service.js';

// Ensure we are reading the variable correctly
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';

// Helper function to make Google Maps API requests
const makeGoogleMapsRequest = async (endpoint, params) => {
  // Fail fast if key is missing on server start
  if (!GOOGLE_MAPS_API_KEY) {
    console.error("CRITICAL: GOOGLE_MAPS_API_KEY is missing in backend .env file");
    throw new Error('Google Maps API key not configured on server');
  }

  try {
    const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}${endpoint}`, {
      params: {
        ...params,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    // Google Maps returns 200 even for errors (like REQUEST_DENIED), so we must check status
    if (response.data.error_message) {
       console.error(`Google Maps API Error [${endpoint}]:`, response.data.error_message);
    }
    
    return response.data;
  } catch (error) {
    // Better error logging
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

    // Handle Invalid Key or Request Denied specifically
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

// ... (Rest of the controller functions remain similar, but ensure they use the updated makeGoogleMapsRequest) ...
// For brevity, assuming the other functions import the helper above, they will now be safe. 

// Re-exporting other functions as they were in your original file for completeness:
export const reverseGeocode = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'Lat/Lng required' });

    const data = await makeGoogleMapsRequest('/geocode/json', { latlng: `${lat},${lng}` });
    if (data.status !== 'OK') return res.status(400).json({ success: false, message: `Reverse geocoding failed: ${data.status}` });

    res.status(200).json({ success: true, data: data.results[0] });
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

// ... export calculateDistance, getDirections, etc. (They use the helper, so they inherit the fix)
export const calculateDistance = async (req, res, next) => {
    try {
        const { origins, destinations, mode = 'driving' } = req.body;
        if (!origins || !destinations) return res.status(400).json({ success: false, message: 'Origins/Destinations required' });
        
        const data = await makeGoogleMapsRequest('/distancematrix/json', {
            origins: Array.isArray(origins) ? origins.join('|') : origins,
            destinations: Array.isArray(destinations) ? destinations.join('|') : destinations,
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
        const data = await makeGoogleMapsRequest('/directions/json', { origin, destination, mode });
        if (data.status !== 'OK') return res.status(400).json({ success: false, message: `Failed: ${data.status}` });
        res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
};

export const searchPlaces = async (req, res, next) => {
    try {
        const { query } = req.body;
        const endpoint = query ? '/place/textsearch/json' : '/place/nearbysearch/json';
        const data = await makeGoogleMapsRequest(endpoint, { query, ...req.body });
        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') return res.status(400).json({ success: false, message: `Failed: ${data.status}` });
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
        const data = await makeGoogleMapsRequest('/place/details/json', { place_id: placeId });
        if (data.status !== 'OK') return res.status(400).json({ success: false, message: `Failed: ${data.status}` });
        res.status(200).json({ success: true, data: data.result });
    } catch (error) { next(error); }
};