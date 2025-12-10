import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage
} from '../controllers/messageController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/conversations', getConversations);
router.get('/:conversationId', getMessages);
router.post('/', sendMessage);
router.put('/:messageId/read', markAsRead);
router.delete('/:messageId', deleteMessage);

export default router;
