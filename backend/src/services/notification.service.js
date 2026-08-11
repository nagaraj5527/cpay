import { query } from '../config/postgres.js';

/**
 * Enterprise Notification Service
 * Handles Persistent In-App Notifications and Asynchronous Email Dispatching
 */

export async function createNotification({
  recipientUserId,
  notificationType,
  title,
  message,
  referenceType = null,
  referenceId = null,
  client = null
}) {
  const sql = `
    INSERT INTO cpay.notifications (
      notification_id,
      recipient_user_id,
      notification_type,
      title,
      message,
      reference_type,
      reference_id,
      is_read,
      created_at
    ) VALUES (
      uuid_generate_v4(),
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      FALSE,
      CURRENT_TIMESTAMP
    )
    RETURNING *
  `;

  const values = [
    recipientUserId,
    notificationType,
    title,
    message,
    referenceType,
    referenceId
  ];

  const res = client ? await client.query(sql, values) : await query(sql, values);
  return res.rows[0];
}

export async function getUserNotifications(userId, limit = 50) {
  const sql = `
    SELECT * FROM cpay.notifications
    WHERE recipient_user_id = $1
    ORDER BY created_at DESC
    LIMIT $2
  `;
  const res = await query(sql, [userId, limit]);
  return res.rows;
}

export async function markNotificationAsRead(notificationId, userId) {
  const sql = `
    UPDATE cpay.notifications
    SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
    WHERE notification_id = $1 AND recipient_user_id = $2
    RETURNING *
  `;
  const res = await query(sql, [notificationId, userId]);
  return res.rows[0];
}

export async function markAllNotificationsAsRead(userId) {
  const sql = `
    UPDATE cpay.notifications
    SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
    WHERE recipient_user_id = $1 AND is_read = FALSE
  `;
  await query(sql, [userId]);
  return { success: true };
}
