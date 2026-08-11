import { Router } from 'express';
import { getUserNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, getUserNotifications);
router.put('/read-all', authenticateToken, markAllAsRead);
router.put('/:notificationId/read', authenticateToken, markAsRead);

export default router;
