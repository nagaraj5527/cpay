import pool from '../config/postgres.js';

/*
========================================================
Audit Logging Utility & Middleware
========================================================
*/

export const logAuditAction = async ({ userId, module, action, oldData = null, newData = null, ipAddress = null, userAgent = null }) => {
    try {
        await pool.query(
            `INSERT INTO cpay.audit_logs
             (user_id, module, action, old_data, new_data, ip_address, user_agent, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
            [
                userId || null,
                module,
                action,
                oldData ? JSON.stringify(oldData) : null,
                newData ? JSON.stringify(newData) : null,
                ipAddress || '127.0.0.1',
                userAgent || 'C-PAY-System'
            ]
        );
    } catch (err) {
        console.error('⚠️ Audit Logging Error:', err.message);
    }
};

export const auditMiddleware = (moduleName, actionName) => {
    return async (req, res, next) => {
        const originalSend = res.json;
        res.json = function (body) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                logAuditAction({
                    userId: req.user?.userId || null,
                    module: moduleName,
                    action: actionName,
                    newData: req.body || null,
                    ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                    userAgent: req.get('User-Agent')
                });
            }
            return originalSend.call(this, body);
        };
        next();
    };
};
