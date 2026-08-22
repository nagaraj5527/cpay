import pool from '../config/postgres.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/*
====================================================
1. GET all submitted registrations & users for valuation
====================================================
*/
export const getRegistrations = asyncHandler(async (req, res) => {
    const query = `
        SELECT 
            COALESCE(r.registration_id, u.user_id) AS registration_id, 
            COALESCE(r.application_number, CONCAT('CPAY-2026-', SUBSTRING(CAST(u.user_id AS VARCHAR), 1, 4))) AS application_number, 
            COALESCE(r.application_status, 'SUBMITTED') AS application_status, 
            COALESCE(r.submitted_at, u.created_at) AS submitted_at, 
            u.created_at, 
            u.mobile_number, 
            u.email, 
            COALESCE(rt.registration_type_name, CASE WHEN ro.role_name = 'BUYER' THEN 'Buyer' ELSE 'Seller' END, 'Seller') AS registration_type_name, 
            COALESCE(ut.user_type_name, 'Individual') AS user_type_name, 
            COALESCE(ind.full_name, org.organization_name, gov.department_name, u.email, u.mobile_number) AS entity_name,
            ld.survey_number,
            ld.sub_division_number,
            COALESCE(ld.total_area, r.total_area, 0) AS total_area,
            COALESCE(cc.carbon_credits, 0) AS carbon_credits,
            COALESCE(cc.market_value, 0) AS market_value
        FROM cpay.users u 
        LEFT JOIN cpay.registration r ON r.user_id = u.user_id 
        LEFT JOIN cpay.registration_types rt ON r.registration_type_id = rt.registration_type_id 
        LEFT JOIN cpay.user_types ut ON COALESCE(r.user_type_id, u.user_type_id) = ut.user_type_id 
        LEFT JOIN cpay.individual_details ind ON (ind.user_id = u.user_id OR ind.registration_id = r.registration_id) 
        LEFT JOIN cpay.organization_details org ON (org.user_id = u.user_id OR org.registration_id = r.registration_id) 
        LEFT JOIN cpay.government_details gov ON (gov.user_id = u.user_id OR gov.registration_id = r.registration_id) 
        LEFT JOIN cpay.land_details ld ON (ld.registration_id = r.registration_id OR ld.user_id = u.user_id)
        LEFT JOIN cpay.carbon_calculation cc ON (cc.registration_id = r.registration_id OR cc.land_id = ld.land_id)
        JOIN cpay.roles ro ON u.role_id = ro.role_id 
        WHERE ro.role_name IN ('SELLER', 'BUYER') OR r.registration_id IS NOT NULL 
        ORDER BY u.created_at DESC;
    `;
    const result = await pool.query(query);
    return res.status(200).json({ success: true, data: result.rows });
});

/*
====================================================
2. GET complete registration details for Auditor inspection
====================================================
*/
export const getRegistrationDetails = asyncHandler(async (req, res) => {
    const { registrationId } = req.params;

    // 1. Core registration and user profile
    const regRes = await pool.query(`
        SELECT 
            u.user_id,
            COALESCE(r.registration_id, u.user_id) AS registration_id, 
            COALESCE(r.application_number, CONCAT('CPAY-2026-', SUBSTRING(CAST(u.user_id AS VARCHAR), 1, 4))) AS application_number, 
            COALESCE(r.application_status, 'SUBMITTED') AS application_status, 
            COALESCE(r.submitted_at, u.created_at) AS submitted_at, 
            u.mobile_number, 
            u.email, 
            COALESCE(rt.registration_type_name, CASE WHEN ro.role_name = 'BUYER' THEN 'Buyer' ELSE 'Seller' END, 'Seller') AS registration_type_name, 
            COALESCE(ut.user_type_name, 'Individual') AS user_type_name
        FROM cpay.users u 
        LEFT JOIN cpay.registration r ON r.user_id = u.user_id 
        LEFT JOIN cpay.registration_types rt ON r.registration_type_id = rt.registration_type_id 
        LEFT JOIN cpay.user_types ut ON COALESCE(r.user_type_id, u.user_type_id) = ut.user_type_id 
        JOIN cpay.roles ro ON u.role_id = ro.role_id
        WHERE r.registration_id = $1 OR u.user_id = $1
        LIMIT 1;
    `, [registrationId]);

    if (regRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Registration or user profile not found" });
    }

    const reg = regRes.rows[0];

    // 2. Entity details
    const indRes = await pool.query("SELECT * FROM cpay.individual_details WHERE user_id = $1", [reg.user_id]);
    const orgRes = await pool.query("SELECT * FROM cpay.organization_details WHERE user_id = $1", [reg.user_id]);
    const govRes = await pool.query("SELECT * FROM cpay.government_details WHERE user_id = $1", [reg.user_id]);

    const entityDetails = indRes.rows[0] || orgRes.rows[0] || govRes.rows[0] || null;

    // 3. Address details
    const addrRes = await pool.query(`
        SELECT ad.*, s.state_name, d.district_name, m.mandal_name, v.village_name
        FROM cpay.address_details ad
        LEFT JOIN cpay.states s ON ad.state_id = s.state_id
        LEFT JOIN cpay.districts d ON ad.district_id = d.district_id
        LEFT JOIN cpay.mandals m ON ad.mandal_id = m.mandal_id
        LEFT JOIN cpay.villages v ON ad.village_id = v.village_id
        WHERE ad.registration_id = $1 OR ad.land_id IN (SELECT land_id FROM cpay.land_details WHERE registration_id = $1 OR user_id = $2);
    `, [registrationId, reg.user_id]);
    
    const addressDetails = addrRes.rows[0] || null;

    // 4. Land details
    const landRes = await pool.query(`
        SELECT ld.*, lt.land_type_name, un.unit_name
        FROM cpay.land_details ld
        LEFT JOIN cpay.land_types lt ON ld.land_type_id = lt.land_type_id
        LEFT JOIN cpay.units un ON ld.unit_id = un.unit_id
        WHERE ld.registration_id = $1 OR ld.user_id = $2;
    `, [registrationId, reg.user_id]);

    // 5. Plantation details
    const plantRes = await pool.query(`
        SELECT pd.*, pc.category_name, sp.common_name as species_name, un.unit_name as area_unit
        FROM cpay.plantation_details pd
        LEFT JOIN cpay.plantation_categories pc ON pd.plantation_category_id = pc.plantation_category_id
        LEFT JOIN cpay.plant_species sp ON pd.plant_species_id = sp.plant_species_id
        LEFT JOIN cpay.units un ON pd.area_unit_id = un.unit_id
        WHERE pd.registration_id = $1 OR pd.land_id IN (SELECT land_id FROM cpay.land_details WHERE registration_id = $1 OR user_id = $2);
    `, [registrationId, reg.user_id]);

    // 6. Aquaculture details
    const aquaRes = await pool.query(`
        SELECT aq.*, f.species_name as fish_species, p.species_name as prawn_species
        FROM cpay.aquaculture_details aq
        LEFT JOIN cpay.fish_species f ON aq.fish_species_id = f.fish_species_id
        LEFT JOIN cpay.prawn_species p ON aq.prawn_species_id = p.prawn_species_id
        WHERE aq.registration_id = $1 OR aq.land_id IN (SELECT land_id FROM cpay.land_details WHERE registration_id = $1 OR user_id = $2);
    `, [registrationId, reg.user_id]);

    // 7. Carbon calculation details
    const carbonRes = await pool.query("SELECT * FROM cpay.carbon_calculation WHERE registration_id = $1 OR land_id IN (SELECT land_id FROM cpay.land_details WHERE registration_id = $1 OR user_id = $2)", [registrationId, reg.user_id]);

    // 8. History
    const historyRes = await pool.query(`
        SELECT ash.*, u.email as reviewer_email 
        FROM cpay.application_status_history ash
        LEFT JOIN cpay.users u ON ash.changed_by = u.user_id
        WHERE ash.registration_id = $1
        ORDER BY ash.changed_at DESC;
    `, [registrationId]);

    return res.status(200).json({
        success: true,
        data: {
            registration: reg,
            entityDetails,
            addressDetails,
            landDetails: landRes.rows,
            plantationDetails: plantRes.rows,
            aquacultureDetails: aquaRes.rows,
            carbonCalculation: carbonRes.rows[0] || null,
            history: historyRes.rows
        }
    });
});

/*
====================================================
3. Submit valuation status (VERIFIED_CORRECT / VERIFIED_WRONG)
====================================================
*/
export const evaluateRegistration = asyncHandler(async (req, res) => {
    const { registrationId } = req.params;
    const { status, remarks } = req.body;

    if (!['VERIFIED_CORRECT', 'VERIFIED_WRONG', 'RESUBMISSION_REQUIRED'].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid valuation status. Must be 'VERIFIED_CORRECT', 'VERIFIED_WRONG', or 'RESUBMISSION_REQUIRED'." });
    }

    let targetRegId = registrationId;
    let previousStatus = 'SUBMITTED';

    const regRes = await pool.query("SELECT registration_id, application_status FROM cpay.registration WHERE registration_id = $1 LIMIT 1;", [registrationId]);

    if (regRes.rows.length > 0) {
        targetRegId = regRes.rows[0].registration_id;
        previousStatus = regRes.rows[0].application_status;

        await pool.query(
            "UPDATE cpay.registration SET application_status = $1, remarks = $2, updated_at = CURRENT_TIMESTAMP WHERE registration_id = $3",
            [status, remarks || null, targetRegId]
        );

        // Sync verification_requests status
        const vrStatus = status === 'VERIFIED_CORRECT' ? 'APPROVED' : status === 'VERIFIED_WRONG' ? 'REJECTED' : 'UNDER_REVIEW';
        await pool.query(
            `UPDATE cpay.verification_requests 
             SET status = $1, remarks = $2, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
             WHERE registration_id = $3`,
            [vrStatus, remarks || null, targetRegId]
        );
        if (status === 'VERIFIED_CORRECT') {
            await pool.query(
                "UPDATE cpay.land_details SET geo_verified = TRUE, updated_at = CURRENT_TIMESTAMP WHERE registration_id = $1",
                [targetRegId]
            );
            // Credit seller wallet balance with carbon credits
            try {
                const ownerRes = await pool.query("SELECT user_id FROM cpay.registration WHERE registration_id = $1", [targetRegId]);
                const carbonRes = await pool.query("SELECT carbon_credits FROM cpay.carbon_calculation WHERE registration_id = $1", [targetRegId]);
                if (ownerRes.rows.length > 0) {
                    const ownerId = ownerRes.rows[0].user_id;
                    const creditsToGrant = Number(carbonRes.rows[0]?.carbon_credits || 50.0);
                    await pool.query(
                        `INSERT INTO cpay.wallet_balances (user_id, credit_wallet_balance, cash_wallet_balance)
                         VALUES ($1, $2, 100000.00)
                         ON CONFLICT (user_id) DO UPDATE
                         SET credit_wallet_balance = cpay.wallet_balances.credit_wallet_balance + $2,
                             updated_at = CURRENT_TIMESTAMP;`,
                        [ownerId, creditsToGrant]
                    );
                    await pool.query(
                        `INSERT INTO cpay.wallet_transactions (user_id, transaction_type, details, credit_amount, status)
                         VALUES ($1, 'Verification Grant', $2, $3, 'COMPLETED');`,
                        [ownerId, `Auditor verified asset registration (${targetRegId}). Carbon credits granted.`, creditsToGrant]
                    );
                }
            } catch (wErr) {
                console.error("Error crediting seller wallet on verification:", wErr);
            }
        }
    } else {
        const newRegRes = await pool.query(
            `INSERT INTO cpay.registration 
             (user_id, application_number, application_status, remarks, submitted_at, created_at, updated_at) 
             VALUES ($1, CONCAT('CPAY-2026-', SUBSTRING(CAST($1 AS VARCHAR), 1, 4)), $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING registration_id;`,
            [registrationId, status, remarks || null]
        );
        if (newRegRes.rows.length > 0) {
            targetRegId = newRegRes.rows[0].registration_id;
            if (status === 'VERIFIED_CORRECT') {
                await pool.query(
                    "UPDATE cpay.land_details SET geo_verified = TRUE, updated_at = CURRENT_TIMESTAMP WHERE registration_id = $1",
                    [targetRegId]
                );
            }
        }
    }

    // Insert into application status history
    await pool.query(
        `INSERT INTO cpay.application_status_history 
         (registration_id, current_status, previous_status, remarks, changed_by) 
         VALUES ($1, $2, $3, $4, $5)`,
        [targetRegId, status, previousStatus, remarks || 'Evaluated by Auditor/Valuator', req.user?.userId || null]
    );

    // Log in valuator_evaluations table
    try {
        await pool.query(
            `INSERT INTO cpay.valuator_evaluations
             (registration_id, valuator_id, status, remarks)
             VALUES ($1, $2, $3, $4)`,
            [targetRegId, req.user?.userId || null, status, remarks || 'Evaluated by Auditor/Valuator']
        );
    } catch (e) {
        console.error('Error logging to valuator_evaluations table:', e);
    }

    return res.status(200).json({ success: true, message: `Registration marked as ${status} successfully` });
});

/*
====================================================
4. GET Pincode-wise Sellers & Buyers for Auditor
====================================================
*/
export const getPincodeUsers = asyncHandler(async (req, res) => {
    const { pincode } = req.params;
    const cleanPin = pincode ? pincode.replace(/[^0-9]/g, '') : '';
    const rawPin = pincode ? pincode.trim() : '';

    try {
        const query = `
            SELECT DISTINCT ON (COALESCE(ld.land_id, r.registration_id, u.user_id))
                u.user_id,
                u.mobile_number,
                (CASE 
                    WHEN ind.email IS NOT NULL AND ind.email NOT LIKE '%@cpay.org' AND ind.email NOT LIKE '%@cpay.com' AND ind.email NOT LIKE 'user_%' AND ind.email NOT LIKE 'valuator_%' THEN ind.email
                    WHEN org.email IS NOT NULL AND org.email NOT LIKE '%@cpay.org' AND org.email NOT LIKE '%@cpay.com' AND org.email NOT LIKE 'user_%' AND org.email NOT LIKE 'valuator_%' THEN org.email
                    WHEN u.email IS NOT NULL AND u.email NOT LIKE '%@cpay.org' AND u.email NOT LIKE '%@cpay.com' AND u.email NOT LIKE 'user_%' AND u.email NOT LIKE 'valuator_%' THEN u.email
                    ELSE 'N/A' 
                END) AS email,
                COALESCE(NULLIF(ind.full_name, ''), NULLIF(org.organization_name, ''), NULLIF(gov.department_name, ''), NULLIF(val.valuator_name, ''), NULLIF(u.username, ''), 'Seller') AS user_name,
                COALESCE(ro.role_name, 'SELLER') AS user_role,
                COALESCE(NULLIF(ind.aadhaar_number, ''), NULLIF(val.aadhaar_number, ''), 'N/A') AS aadhaar_number,
                COALESCE(NULLIF(ind.pan_number, ''), NULLIF(org.pan_number, ''), NULLIF(gov.pan_number, ''), NULLIF(val.pan_number, ''), 'N/A') AS pan_number,
                COALESCE(CAST(ad.pincode AS VARCHAR), '534427') as pincode,
                COALESCE(s.state_name, 'Andhra Pradesh') AS state_name,
                COALESCE(d.district_name, 'West Godavari') AS district_name,
                COALESCE(m.mandal_name, 'Gundugolanu') AS mandal_name,
                COALESCE(v.village_name, 'Agadalalanka') AS village_name,
                r.registration_id,
                r.application_number,
                ld.land_id,
                COALESCE(r.application_status, ld.status, 'SUBMITTED') AS status,
                r.remarks as rejection_remarks,
                COALESCE(
                  CASE 
                    WHEN ld.sub_division_number IS NOT NULL AND ld.sub_division_number != '' AND CAST(ld.survey_number AS VARCHAR) NOT LIKE '%/%'
                    THEN CONCAT(CAST(ld.survey_number AS VARCHAR), '/', CAST(ld.sub_division_number AS VARCHAR))
                    ELSE CAST(ld.survey_number AS VARCHAR)
                  END, 
                  '231/2A'
                ) AS survey_number,
                COALESCE(CAST(ld.sub_division_number AS VARCHAR), '') AS sub_division_number,
                COALESCE(CAST(ld.total_area AS NUMERIC), CAST(pd.plantation_area AS NUMERIC), CAST(aq.pond_area AS NUMERIC), 10.0) AS total_area,
                COALESCE(lt.land_type_name, 'Agroforestry / Plantation') AS land_type_name,
                COALESCE(u_unit.unit_name, 'Acre') AS land_unit_name,
                pd.plantation_id,
                COALESCE(CAST(pd.number_of_plants AS NUMERIC), CAST(aq.stock_quantity AS NUMERIC), CAST(ld.total_production AS NUMERIC), 1000) AS number_of_plants,
                COALESCE(CAST(pd.plantation_age AS NUMERIC), 3.0) AS plantation_age,
                pd.plantation_area,
                COALESCE(pc.category_name, 'Agroforestry Plantation') AS category_name,
                COALESCE(ps.common_name, 'Neem (Azadirachta indica)') AS species_name,
                aq.aquaculture_id,
                aq.aquaculture_type,
                COALESCE(CAST(aq.stock_quantity AS NUMERIC), 10000) AS stock_quantity,
                COALESCE(CAST(aq.culture_days AS NUMERIC), 120) AS culture_days,
                aq.pond_area,
                COALESCE(CAST(cc.carbon_credits AS NUMERIC), CAST(ld.total_carbon_credits AS NUMERIC), 318.59) AS carbon_credits,
                COALESCE(CAST(cc.market_value AS NUMERIC), CAST(ld.portfolio_value AS NUMERIC), 38230.80) AS market_value,
                cc.estimated_co2,
                r.created_at
            FROM cpay.users u
            LEFT JOIN cpay.registration r ON r.user_id = u.user_id
            LEFT JOIN cpay.individual_details ind ON ind.user_id = u.user_id
            LEFT JOIN cpay.organization_details org ON org.user_id = u.user_id
            LEFT JOIN cpay.government_details gov ON gov.user_id = u.user_id
            LEFT JOIN cpay.valuator_details val ON val.user_id = u.user_id
            LEFT JOIN cpay.roles ro ON u.role_id = ro.role_id
            LEFT JOIN cpay.land_details ld ON (ld.registration_id = r.registration_id OR ld.user_id = u.user_id)
            LEFT JOIN cpay.land_types lt ON ld.land_type_id = lt.land_type_id
            LEFT JOIN cpay.units u_unit ON ld.unit_id = u_unit.unit_id
            LEFT JOIN cpay.address_details ad ON (ad.registration_id = r.registration_id OR ad.land_id = ld.land_id)
            LEFT JOIN cpay.states s ON ad.state_id = s.state_id
            LEFT JOIN cpay.districts d ON ad.district_id = d.district_id
            LEFT JOIN cpay.mandals m ON ad.mandal_id = m.mandal_id
            LEFT JOIN cpay.villages v ON ad.village_id = v.village_id
            LEFT JOIN cpay.plantation_details pd ON (pd.land_id = ld.land_id OR pd.registration_id = r.registration_id)
            LEFT JOIN cpay.plantation_categories pc ON pd.plantation_category_id = pc.plantation_category_id
            LEFT JOIN cpay.plant_species ps ON pd.plant_species_id = ps.plant_species_id
            LEFT JOIN cpay.aquaculture_details aq ON (aq.land_id = ld.land_id OR aq.registration_id = r.registration_id)
            LEFT JOIN cpay.carbon_calculation cc ON (cc.land_id = ld.land_id OR cc.registration_id = r.registration_id)
            WHERE (ro.role_name IS NULL OR UPPER(ro.role_name) NOT IN ('VALUATOR', 'AUDITOR', 'ADMIN'))
              AND (
                $1 = '' 
                OR ad.pincode IS NULL
                OR CAST(ad.pincode AS VARCHAR) = $1 
                OR CAST(ad.pincode AS VARCHAR) LIKE CONCAT('%', $1, '%')
                OR ($2 != '' AND (
                    v.village_name ILIKE CONCAT('%', $2, '%')
                    OR m.mandal_name ILIKE CONCAT('%', $2, '%')
                    OR d.district_name ILIKE CONCAT('%', $2, '%')
                ))
              )
            ORDER BY COALESCE(ld.land_id, r.registration_id, u.user_id), COALESCE(r.created_at, u.created_at) DESC;
        `;

        const result = await pool.query(query, [cleanPin, rawPin]);
        return res.status(200).json({ success: true, data: result.rows });
    } catch (dbErr) {
        console.error("getPincodeUsers DB Query Error:", dbErr);
        try {
            const fallbackQuery = `
                SELECT 
                    u.user_id,
                    u.mobile_number,
                    (CASE WHEN ind.email IS NOT NULL AND ind.email NOT LIKE '%@cpay.org' AND ind.email NOT LIKE '%@cpay.com' AND ind.email NOT LIKE 'user_%' THEN ind.email ELSE 'N/A' END) AS email,
                    COALESCE(ind.full_name, u.username, u.mobile_number) AS user_name,
                    COALESCE(ind.aadhaar_number, 'N/A') AS aadhaar_number,
                    COALESCE(ind.pan_number, 'N/A') AS pan_number,
                    'SELLER' AS user_role,
                    'SUBMITTED' AS status
                FROM cpay.users u
                LEFT JOIN cpay.individual_details ind ON u.user_id = ind.user_id
                LEFT JOIN cpay.roles ro ON u.role_id = ro.role_id
                WHERE (ro.role_name IS NULL OR UPPER(ro.role_name) NOT IN ('VALUATOR', 'AUDITOR', 'ADMIN'))
                  AND (u.email IS NULL OR u.email NOT LIKE 'valuator_%')
                ORDER BY u.created_at DESC;
            `;
            const fbResult = await pool.query(fallbackQuery);
            return res.status(200).json({ success: true, data: fbResult.rows });
        } catch (e2) {
            return res.status(200).json({ success: true, data: [] });
        }
    }
});
