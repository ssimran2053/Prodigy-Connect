import express from 'express';
import {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  logout,
  searchUsers
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.get('/search', protect, searchUsers);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

export default router;
