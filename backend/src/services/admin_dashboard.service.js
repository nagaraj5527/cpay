import pool from '../config/postgres.js';
import { logAuditAction } from '../middleware/audit.middleware.js';

/*
========================================================
1. GET /api/admin/dashboard - High Performance Parallel Dashboard Load
========================================================
*/
export const getDashboardSummary = async () => {
    // Execute parallel queries across views
    const [summaryRes, trendRes, districtRes, pendingRes, activityRes] = await Promise.all([
        pool.query("SELECT * FROM cpay.v_dashboard_summary;"),
        pool.query("SELECT * FROM cpay.v_registration_trend LIMIT 12;"),
        pool.query("SELECT * FROM cpay.v_district_summary LIMIT 10;"),
        pool.query(`
            SELECT r.registration_id, r.application_number, r.application_status, r.submitted_at,
                   COALESCE(ind.full_name, org.organization_name, gov.department_name, u.email) AS user_name,
                   ld.survey_number
            FROM cpay.registration r
            JOIN cpay.users u ON r.user_id = u.user_id
            LEFT JOIN cpay.land_details ld ON r.registration_id = ld.registration_id
            LEFT JOIN cpay.individual_details ind ON r.user_id = ind.user_id
            LEFT JOIN cpay.organization_details org ON r.user_id = org.user_id
            LEFT JOIN cpay.government_details gov ON r.user_id = gov.user_id
            WHERE r.application_status IN ('SUBMITTED', 'PENDING', 'UNDER_REVIEW')
            ORDER BY r.submitted_at DESC LIMIT 10;
        `),
        pool.query(`
            SELECT al.log_id, al.module, al.action, al.created_at, al.ip_address,
                   u.email AS user_email
            FROM cpay.audit_logs al
            LEFT JOIN cpay.users u ON al.user_id = u.user_id
            ORDER BY al.created_at DESC LIMIT 10;
        `)
    ]);

    const cards = summaryRes.rows[0] || {
        total_users: 0,
        total_assets: 0,
        pending_verifications: 0,
        approved_assets: 0,
        total_carbon_credits: 0,
        portfolio_value: 0
    };

    return {
        success: true,
        data: {
            cards: {
                totalUsers: Number(cards.total_users),
                totalAssets: Number(cards.total_assets),
                pendingVerifications: Number(cards.pending_verifications),
                approvedAssets: Number(cards.approved_assets),
                totalCarbonCredits: Number(cards.total_carbon_credits),
                portfolioValue: Number(cards.portfolio_value)
            },
            charts: {
                registrationTrend: trendRes.rows,
                districtSummary: districtRes.rows
            },
            pendingQueue: pendingRes.rows,
            recentActivities: activityRes.rows
        }
    };
};

/*
========================================================
2. User Management APIs
========================================================
*/
export const getUsers = async () => {
    const res = await pool.query(`
        SELECT u.user_id, u.email, u.mobile_number, u.is_active, u.created_at,
               r.role_name,
               COALESCE(ind.full_name, org.organization_name, gov.department_name, u.email) AS full_name
        FROM cpay.users u
        LEFT JOIN cpay.roles r ON u.role_id = r.role_id
        LEFT JOIN cpay.individual_details ind ON u.user_id = ind.user_id
        LEFT JOIN cpay.organization_details org ON u.user_id = org.user_id
        LEFT JOIN cpay.government_details gov ON u.user_id = gov.user_id
        ORDER BY u.created_at DESC;
    `);
    return { success: true, data: res.rows };
};

/*
========================================================
3. Audit Log Query
========================================================
*/
export const getAuditLogs = async (limit = 50) => {
    const res = await pool.query(`
        SELECT al.*, u.email AS user_email, r.role_name
        FROM cpay.audit_logs al
        LEFT JOIN cpay.users u ON al.user_id = u.user_id
        LEFT JOIN cpay.roles r ON u.role_id = r.role_id
        ORDER BY al.created_at DESC
        LIMIT $1;
    `, [limit]);
    return { success: true, data: res.rows };
};

/*
========================================================
4. Global Cross-Module Search Engine
========================================================
*/
export const globalSearch = async (queryTerm) => {
    if (!queryTerm || queryTerm.trim() === '') {
        return { success: true, data: [] };
    }

    const term = `%${queryTerm.trim()}%`;
    const res = await pool.query(`
        SELECT 'REGISTRATION' AS result_type,
               r.registration_id AS id,
               r.application_number AS title,
               CONCAT('Status: ', r.application_status, ' | Survey: ', COALESCE(ld.survey_number, 'N/A')) AS description,
               r.created_at
        FROM cpay.registration r
        LEFT JOIN cpay.land_details ld ON r.registration_id = ld.registration_id
        WHERE r.application_number ILIKE $1 
           OR ld.survey_number ILIKE $1

        UNION ALL

        SELECT 'USER' AS result_type,
               u.user_id AS id,
               COALESCE(ind.full_name, u.email, u.mobile_number) AS title,
               CONCAT('Email: ', u.email, ' | Mobile: ', u.mobile_number) AS description,
               u.created_at
        FROM cpay.users u
        LEFT JOIN cpay.individual_details ind ON u.user_id = ind.user_id
        WHERE u.email ILIKE $1 
           OR u.mobile_number ILIKE $1 
           OR ind.full_name ILIKE $1 
           OR ind.aadhaar_number ILIKE $1 
           OR ind.pan_number ILIKE $1

        ORDER BY created_at DESC
        LIMIT 20;
    `, [term]);

    return { success: true, data: res.rows };
};

/*
========================================================
5. System Settings APIs
========================================================
*/
export const getSettings = async () => {
    const res = await pool.query(`SELECT * FROM cpay.system_settings ORDER BY category, setting_key;`);
    return { success: true, data: res.rows };
};

export const updateSetting = async (key, value, userId) => {
    const res = await pool.query(`
        UPDATE cpay.system_settings
        SET setting_value = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
        WHERE setting_key = $3
        RETURNING *;
    `, [value, userId, key]);

    await logAuditAction({
        userId,
        module: 'SETTINGS',
        action: 'UPDATE_SETTING',
        newData: { key, value }
    });

    return { success: true, data: res.rows[0] };
};
