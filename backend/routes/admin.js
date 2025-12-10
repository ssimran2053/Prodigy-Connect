import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getStats,
  getRecentActivity,
  flagContent,
  unflagContent
} from '../controllers/adminController.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/stats', getStats);
router.get('/activity', getRecentActivity);
router.post('/flag/:type/:id', flagContent);
router.delete('/flag/:type/:id', unflagContent);

export default router;
