import { query } from '../../database/db.js';

/**
 * Enterprise Audit Service
 * Maintains Immutable Audit Trail for System Security & Compliance
 */
export async function logAuditEvent({
  actorUserId = null,
  action,
  entityType,
  entityId = null,
  oldData = null,
  newData = null,
  ipAddress = null,
  userAgent = null,
  client = null
}) {
  const sql = `
    INSERT INTO cpay.audit_logs (
      audit_id,
      table_name,
      record_id,
      operation_type,
      old_data,
      new_data,
      performed_by,
      performed_at,
      ip_address,
      user_agent
    ) VALUES (
      uuid_generate_v4(),
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      CURRENT_TIMESTAMP,
      $7,
      $8
    )
  `;

  const values = [
    entityType,
    entityId,
    action,
    oldData ? JSON.stringify(oldData) : null,
    newData ? JSON.stringify(newData) : null,
    actorUserId,
    ipAddress,
    userAgent
  ];

  try {
    if (client) {
      await client.query(sql, values);
    } else {
      await query(sql, values);
    }
  } catch (err) {
    console.error('[AUDIT LOG ERROR]', err.message);
  }
}
