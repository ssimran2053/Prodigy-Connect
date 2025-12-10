import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  geocodeAddress,
  reverseGeocode,
  getNearbyServices,
  calculateDistance,
  getDirections,
  searchPlaces,
  validateAddress,
  getPlaceDetails
} from '../controllers/mapsController.js';

const router = express.Router();

// Public routes (no auth required)
router.post('/geocode', geocodeAddress);
router.post('/reverse-geocode', reverseGeocode);
router.post('/distance', calculateDistance);
router.post('/directions', getDirections);
router.post('/search-places', searchPlaces);
router.post('/validate-address', validateAddress);
router.get('/place-details/:placeId', getPlaceDetails);

// Protected routes
router.post('/nearby-services', protect, getNearbyServices);

export default router;
