import express from 'express';
import {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getProviderServices
} from '../controllers/serviceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getServices)
  .post(protect, authorize('provider', 'admin'), createService);

router.route('/:id')
  .get(getService)
  .put(protect, updateService)
  .delete(protect, deleteService);

router.get('/provider/:providerId', getProviderServices);

export default router;
