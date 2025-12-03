import express from 'express';
import {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking,
  confirmBooking,
  completeBooking
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getBookings)
  .post(authorize('seeker', 'admin'), createBooking);

router.route('/:id')
  .get(getBooking)
  .put(updateBooking);

router.put('/:id/cancel', cancelBooking);
router.put('/:id/confirm', authorize('provider', 'admin'), confirmBooking);
router.put('/:id/complete', authorize('provider', 'admin'), completeBooking);

export default router;
