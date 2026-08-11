import { query } from '../config/postgres.js';

/**
 * Enterprise Support System Service
 * Ticket generation, messaging, tracking, and resolution
 */

export async function createSupportTicket({ userId, subject, description, priority = 'MEDIUM' }) {
  const ticketNumber = `TICK-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const sql = `
    INSERT INTO cpay.support_tickets (
      ticket_id,
      ticket_number,
      user_id,
      subject,
      description,
      priority,
      status,
      created_at,
      updated_at
    ) VALUES (
      uuid_generate_v4(),
      $1,
      $2,
      $3,
      $4,
      $5,
      'OPEN',
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    RETURNING *
  `;

  const res = await query(sql, [ticketNumber, userId, subject, description, priority]);
  return res.rows[0];
}

export async function getUserTickets(userId) {
  const sql = `
    SELECT 
      t.*,
      (SELECT COUNT(*) FROM cpay.support_messages m WHERE m.ticket_id = t.ticket_id) as message_count
    FROM cpay.support_tickets t
    WHERE t.user_id = $1
    ORDER BY t.created_at DESC
  `;
  const res = await query(sql, [userId]);
  return res.rows;
}

export async function getAllTickets() {
  const sql = `
    SELECT 
      t.*,
      u.email,
      u.mobile_number,
      (SELECT COUNT(*) FROM cpay.support_messages m WHERE m.ticket_id = t.ticket_id) as message_count
    FROM cpay.support_tickets t
    LEFT JOIN cpay.users u ON t.user_id = u.user_id
    ORDER BY t.created_at DESC
  `;
  const res = await query(sql);
  return res.rows;
}

export async function addSupportMessage({ ticketId, senderId, message, attachmentUrl = null }) {
  const msgSql = `
    INSERT INTO cpay.support_messages (
      message_id,
      ticket_id,
      sender_id,
      message,
      attachment_url,
      created_at
    ) VALUES (
      uuid_generate_v4(),
      $1,
      $2,
      $3,
      $4,
      CURRENT_TIMESTAMP
    )
    RETURNING *
  `;

  const res = await query(msgSql, [ticketId, senderId, message, attachmentUrl]);

  // Update ticket timestamp
  await query(
    `UPDATE cpay.support_tickets SET updated_at = CURRENT_TIMESTAMP WHERE ticket_id = $1`,
    [ticketId]
  );

  return res.rows[0];
}

export async function getTicketDetails(ticketId) {
  const ticketSql = `SELECT * FROM cpay.support_tickets WHERE ticket_id = $1`;
  const ticketRes = await query(ticketSql, [ticketId]);

  if (!ticketRes.rows.length) return null;

  const messagesSql = `
    SELECT m.*, u.username, u.email 
    FROM cpay.support_messages m
    LEFT JOIN cpay.users u ON m.sender_id = u.user_id
    WHERE m.ticket_id = $1
    ORDER BY m.created_at ASC
  `;
  const messagesRes = await query(messagesSql, [ticketId]);

  return {
    ...ticketRes.rows[0],
    messages: messagesRes.rows
  };
}

export async function updateTicketStatus(ticketId, status, resolverId = null) {
  const sql = `
    UPDATE cpay.support_tickets
    SET 
      status = $1,
      resolved_at = CASE WHEN $1 = 'RESOLVED' THEN CURRENT_TIMESTAMP ELSE resolved_at END,
      assigned_to = CASE WHEN $2::uuid IS NOT NULL THEN $2::uuid ELSE assigned_to END,
      updated_at = CURRENT_TIMESTAMP
    WHERE ticket_id = $3
    RETURNING *
  `;
  const res = await query(sql, [status, resolverId, ticketId]);
  return res.rows[0];
}
