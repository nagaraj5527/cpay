import pool from '../config/postgres.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/*
====================================================
Users Management
====================================================
*/

// GET all approved users (Sellers, Buyers, Auditors/Valuators - NO ADMINS)
export const getUsers = asyncHandler(async (req, res) => {
    const query = `
        SELECT 
            u.user_id, 
            u.email, 
            u.mobile_number, 
            u.is_active, 
            COALESCE(r.role_name, 'SELLER') AS role_name, 
            u.created_at,
            COALESCE(ind.full_name, org.organization_name, gov.department_name, vd.name, SPLIT_PART(u.email, '@', 1)) AS entity_name,
            COALESCE(ind.pan_number, ind.aadhaar_number, vd.licence, 'N/A') AS identity_doc
        FROM cpay.users u 
        LEFT JOIN cpay.roles r ON u.role_id = r.role_id 
        LEFT JOIN cpay.individual_details ind ON u.user_id = ind.user_id 
        LEFT JOIN cpay.organization_details org ON u.user_id = org.user_id 
        LEFT JOIN cpay.government_details gov ON u.user_id = gov.user_id 
        LEFT JOIN cpay.valuator_details vd ON u.user_id = vd.user_id
        WHERE (r.role_name IS NULL OR UPPER(r.role_name) NOT IN ('ADMIN', 'SUPER_ADMIN', 'GOVERNMENT'))
          AND u.user_id != '11111111-1111-4111-a111-111111111111'
          AND (u.is_active = TRUE OR vd.is_approved = TRUE)
        ORDER BY u.created_at DESC;
    `;
    const result = await pool.query(query);
    return res.status(200).json({ success: true, data: result.rows });
});

// UPDATE user details
export const updateUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { email, mobileNumber, isActive, roleName } = req.body;

    // Get role_id from roleName
    const roleRes = await pool.query("SELECT role_id FROM cpay.roles WHERE role_name = $1 LIMIT 1", [roleName]);
    if (roleRes.rows.length === 0) {
        throw new Error(`Role name '${roleName}' not found`);
    }
    const roleId = roleRes.rows[0].role_id;

    const query = `
        UPDATE cpay.users 
        SET email = $1, mobile_number = $2, is_active = $3, role_id = $4, updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = $5 
        RETURNING *;
    `;
    const result = await pool.query(query, [email, mobileNumber, isActive, roleId, userId]);
    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, message: "User updated successfully", data: result.rows[0] });
});

// DELETE a user
export const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    // Prevent self deletion
    if (userId === req.user.userId) {
        return res.status(400).json({ success: false, message: "You cannot delete your own admin account" });
    }

    await pool.query("DELETE FROM cpay.valuator_details WHERE user_id = $1;", [userId]);
    const result = await pool.query("DELETE FROM cpay.users WHERE user_id = $1 RETURNING *;", [userId]);
    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, message: "User deleted successfully" });
});

/*
====================================================
Registrations Management
====================================================
*/

// GET all registrations
export const getRegistrations = asyncHandler(async (req, res) => {
    const query = `
        SELECT 
            r.registration_id, 
            r.application_number, 
            r.application_status, 
            r.submitted_at, 
            r.created_at, 
            u.mobile_number, 
            u.email, 
            rt.registration_type_name, 
            ut.user_type_name, 
            COALESCE(ind.full_name, org.organization_name, gov.department_name) AS entity_name 
        FROM cpay.registration r 
        JOIN cpay.users u ON r.user_id = u.user_id 
        JOIN cpay.registration_types rt ON r.registration_type_id = rt.registration_type_id 
        LEFT JOIN cpay.user_types ut ON COALESCE(r.user_type_id, u.user_type_id) = ut.user_type_id 
        LEFT JOIN cpay.individual_details ind ON u.user_id = ind.user_id 
        LEFT JOIN cpay.organization_details org ON u.user_id = org.user_id 
        LEFT JOIN cpay.government_details gov ON u.user_id = gov.user_id 
        ORDER BY r.created_at DESC;
    `;
    const result = await pool.query(query);
    return res.status(200).json({ success: true, data: result.rows });
});

// UPDATE registration status / details
export const updateRegistration = asyncHandler(async (req, res) => {
    const { registrationId } = req.params;
    const { applicationStatus, remarks } = req.body;

    const currentRes = await pool.query("SELECT application_status FROM cpay.registration WHERE registration_id = $1", [registrationId]);
    if (currentRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Registration not found" });
    }
    const previousStatus = currentRes.rows[0].application_status;

    await pool.query(
        "UPDATE cpay.registration SET application_status = $1, updated_at = CURRENT_TIMESTAMP WHERE registration_id = $2",
        [applicationStatus, registrationId]
    );

    // Save history
    await pool.query(
        `INSERT INTO cpay.application_status_history 
         (registration_id, current_status, previous_status, remarks, changed_by) 
         VALUES ($1, $2, $3, $4, $5)`,
        [registrationId, applicationStatus, previousStatus, remarks || 'Updated by Admin', req.user.userId]
    );

    return res.status(200).json({ success: true, message: "Registration status updated successfully" });
});

// DELETE a registration
export const deleteRegistration = asyncHandler(async (req, res) => {
    const { registrationId } = req.params;
    const result = await pool.query("DELETE FROM cpay.registration WHERE registration_id = $1 RETURNING *;", [registrationId]);
    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Registration not found" });
    }
    return res.status(200).json({ success: true, message: "Registration deleted successfully" });
});

/*
====================================================
Valuators Management
====================================================
*/

// GET all valuators
export const getValuators = asyncHandler(async (req, res) => {
    const query = `
        SELECT vd.valuator_id, vd.name, vd.address, vd.licence, vd.is_approved, u.mobile_number, u.email, vd.created_at, u.user_id AS user_id 
        FROM cpay.valuator_details vd 
        JOIN cpay.users u ON vd.user_id = u.user_id 
        ORDER BY vd.created_at DESC;
    `;
    const result = await pool.query(query);
    return res.status(200).json({ success: true, data: result.rows });
});

// Toggle Valuator approval
export const approveValuator = asyncHandler(async (req, res) => {
    const { valuatorId } = req.params;
    const { isApproved } = req.body;

    const result = await pool.query(
        "UPDATE cpay.valuator_details SET is_approved = $1, updated_at = CURRENT_TIMESTAMP WHERE valuator_id = $2 RETURNING *;",
        [isApproved, valuatorId]
    );
    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Valuator not found" });
    }
    
    // Toggle active status in user table as well
    const userId = result.rows[0].user_id;
    await pool.query("UPDATE cpay.users SET is_active = $1 WHERE user_id = $2", [isApproved, userId]);

    const statusMsg = isApproved ? "approved" : "revoked";
    return res.status(200).json({ success: true, message: `Valuator permission ${statusMsg} successfully` });
});

/*
====================================================
Pending Approvals Management (Sellers, Buyers, Auditors)
====================================================
*/

// GET all pending approvals (Sellers, Buyers, Auditors/Valuators)
export const getPendingQueue = asyncHandler(async (req, res) => {
    const query = `
        SELECT 
            r.registration_id AS id,
            'REGISTRATION' AS category,
            COALESCE(ind.full_name, org.organization_name, gov.department_name, u.email, 'Applicant') AS applicant_name,
            COALESCE(rt.registration_type_name, 'Seller / Farmer') AS applicant_type,
            u.mobile_number,
            u.email,
            COALESCE(ind.pan_number, ind.aadhaar_number, 'N/A') AS identity_doc,
            r.application_status AS status,
            TO_CHAR(r.created_at, 'DD Mon YYYY') AS date,
            r.created_at
        FROM cpay.registration r
        JOIN cpay.users u ON r.user_id = u.user_id
        LEFT JOIN cpay.registration_types rt ON r.registration_type_id = rt.registration_type_id
        LEFT JOIN cpay.individual_details ind ON u.user_id = ind.user_id
        LEFT JOIN cpay.organization_details org ON u.user_id = org.user_id
        LEFT JOIN cpay.government_details gov ON u.user_id = gov.user_id
        WHERE UPPER(r.application_status) IN ('PENDING', 'SUBMITTED', 'UNDER_REVIEW')

        UNION ALL

        SELECT 
            vd.valuator_id AS id,
            'VALUATOR' AS category,
            vd.name AS applicant_name,
            'Auditor / Valuator' AS applicant_type,
            u.mobile_number,
            u.email,
            COALESCE(vd.licence, 'Licence Pending') AS identity_doc,
            'PENDING' AS status,
            TO_CHAR(vd.created_at, 'DD Mon YYYY') AS date,
            vd.created_at
        FROM cpay.valuator_details vd
        JOIN cpay.users u ON vd.user_id = u.user_id
        WHERE vd.is_approved = FALSE

        ORDER BY created_at DESC;
    `;
    const result = await pool.query(query);
    return res.status(200).json({ success: true, data: result.rows });
});

// Approve Pending Item
export const approvePendingItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { category } = req.body;

    if (category === 'VALUATOR') {
        const valRes = await pool.query(
            "UPDATE cpay.valuator_details SET is_approved = TRUE, updated_at = CURRENT_TIMESTAMP WHERE valuator_id = $1 RETURNING user_id;",
            [itemId]
        );
        if (valRes.rows.length > 0) {
            await pool.query("UPDATE cpay.users SET is_active = TRUE WHERE user_id = $1;", [valRes.rows[0].user_id]);
        }
    } else {
        const regRes = await pool.query(
            "UPDATE cpay.registration SET application_status = 'APPROVED', updated_at = CURRENT_TIMESTAMP WHERE registration_id = $1 RETURNING user_id;",
            [itemId]
        );
        if (regRes.rows.length > 0) {
            await pool.query("UPDATE cpay.users SET is_active = TRUE WHERE user_id = $1;", [regRes.rows[0].user_id]);
        }
    }

    return res.status(200).json({ success: true, message: "Applicant approved successfully and added to Active Users." });
});

// Reject Pending Item
export const rejectPendingItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { category } = req.body;

    if (category === 'VALUATOR') {
        await pool.query("DELETE FROM cpay.valuator_details WHERE valuator_id = $1;", [itemId]);
    } else {
        await pool.query(
            "UPDATE cpay.registration SET application_status = 'REJECTED', updated_at = CURRENT_TIMESTAMP WHERE registration_id = $1;",
            [itemId]
        );
    }

    return res.status(200).json({ success: true, message: "Application rejected." });
});
