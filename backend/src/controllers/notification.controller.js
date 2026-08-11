import * as notificationService from '../services/notification.service.js';

export async function getUserNotifications(req, res, next) {
  try {
    const userId = req.user.user_id;
    const notifications = await notificationService.getUserNotifications(userId);

    return res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { notificationId } = req.params;

    const notification = await notificationService.markNotificationAsRead(notificationId, userId);
    return res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    const userId = req.user.user_id;
    await notificationService.markAllNotificationsAsRead(userId);

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    next(err);
  }
}
