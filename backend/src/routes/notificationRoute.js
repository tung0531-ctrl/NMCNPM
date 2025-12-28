import express from 'express';
import { adminOnly } from '../middlewares/adminMiddleware.js';
import {
  sendNotificationToUsers,
  getMyNotifications,
  markAsRead,
  getUnreadCount,
  getSentNotifications,
  getNotificationRecipients
} from '../controllers/notificationController.js';

const router = express.Router();

// Admin only - send notification to multiple users
router.post('/send', adminOnly, sendNotificationToUsers);

// Admin only - get sent notifications and recipients
router.get('/sent', adminOnly, getSentNotifications);
router.get('/recipients', adminOnly, getNotificationRecipients);

// User routes - get their notifications
router.get('/', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);

export default router;
