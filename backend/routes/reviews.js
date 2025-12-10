import express from 'express';
import {
  getServiceReviews,
  getProviderReviews,
  createReview,
  updateReview,
  deleteReview,
  addResponse
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/service/:serviceId', getServiceReviews);
router.get('/provider/:providerId', getProviderReviews);

router.route('/')
  .post(protect, authorize('seeker', 'admin'), createReview);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

router.put('/:id/response', protect, authorize('provider', 'admin'), addResponse);

export default router;
