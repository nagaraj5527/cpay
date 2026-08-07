import pool from '../config/postgres.js';

/*
========================================================
RBAC Role & Permission Middleware
========================================================
*/

export const requireRole = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const userRole = (req.user.role || req.user.roleName || '').toUpperCase();
        const rolesUpper = allowedRoles.map(r => r.toUpperCase());

        if (rolesUpper.includes('ADMIN') && (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'SUPER ADMIN')) {
            return next();
        }

        if (rolesUpper.includes(userRole) || userRole === 'SUPER_ADMIN' || userRole === 'SUPER ADMIN') {
            return next();
        }

        return res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges' });
    };
};
