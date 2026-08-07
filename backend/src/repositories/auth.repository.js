import pool from '../config/postgres.js';

/*
====================================================
Find User By Mobile Number
====================================================
*/

export const findUserByMobile = async (mobileNumber) => {
    const cleanMobile = mobileNumber ? mobileNumber.replace(/[^0-9]/g, '') : '';
    const last10 = cleanMobile.length >= 10 ? cleanMobile.slice(-10) : cleanMobile;

    const query = `
        SELECT
            u.user_id,
            u.role_id,
            u.email,
            u.mobile_number,
            u.is_active,
            r.role_name
        FROM cpay.users u
        JOIN cpay.roles r
        ON u.role_id = r.role_id
        WHERE u.mobile_number = $1
           OR (RIGHT(REGEXP_REPLACE(u.mobile_number, '[^0-9]', '', 'g'), 10) = $2 AND $2 <> '')
        LIMIT 1;
    `;

    const result = await pool.query(query, [mobileNumber, last10]);

    return result.rows[0];

};

/*
====================================================
Save OTP
====================================================
*/

export const saveOTP = async (data) => {

    const {

        mobileNumber,

        userType,

        otp,

        expiryTime

    } = data;

    const query = `
        INSERT INTO cpay.otp_verification
        (
            mobile_number,
            otp_code,
            purpose,
            expires_at,
            verified,
            created_at
        )

        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            FALSE,
            CURRENT_TIMESTAMP
        );
    `;

    await pool.query(query, [

        mobileNumber,

        otp,

        'LOGIN',

        expiryTime

    ]);

};

/*
====================================================
Find Latest OTP
====================================================
*/

export const findLatestOTP = async (mobileNumber) => {
    const cleanMobile = mobileNumber ? mobileNumber.replace(/[^0-9]/g, '') : '';
    const last10 = cleanMobile.length >= 10 ? cleanMobile.slice(-10) : cleanMobile;

    const query = `
        SELECT
            otp_id,
            otp_code,
            expires_at,
            verified
        FROM cpay.otp_verification
        WHERE mobile_number = $1
           OR (RIGHT(REGEXP_REPLACE(mobile_number, '[^0-9]', '', 'g'), 10) = $2 AND $2 <> '')
        ORDER BY created_at DESC
        LIMIT 1;
    `;

    const result = await pool.query(query, [mobileNumber, last10]);

    return result.rows[0];

};

/*
====================================================
Mark OTP As Verified
====================================================
*/

export const markOTPVerified = async (otpId) => {

    const query = `
        UPDATE cpay.otp_verification
        SET
            verified = TRUE,
            verified_at = CURRENT_TIMESTAMP
        WHERE otp_id = $1;
    `;

    await pool.query(query, [otpId]);

};

/*
====================================================
Update Last Login
====================================================
*/

export const updateLastLogin = async (userId) => {

    const query = `
        UPDATE cpay.users
        SET
            last_login = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1;
    `;

    await pool.query(query, [userId]);

};

/*
====================================================
Find User By ID
====================================================
*/

export const findUserById = async (userId) => {

    const query = `

        SELECT

            u.user_id,

            u.username,

            u.email,

            u.mobile_number,

            u.last_login,

            u.is_active,

            r.role_name

        FROM cpay.users u

        JOIN cpay.roles r

        ON u.role_id = r.role_id

        WHERE u.user_id = $1

        LIMIT 1;

    `;

    const result = await pool.query(

        query,

        [userId]

    );

    return result.rows[0];

};

/*
====================================================
Create User (Signup)
====================================================
*/

export const createUser = async (data) => {

    const {
        userId,
        roleId,
        email,
        mobileNumber,
        passwordHash,
        userTypeName,
        username
    } = data;

    // Resolve user_type_id from userTypeName or default to 'Individual'
    const typeName = userTypeName || 'Individual';
    const typeRes = await pool.query(
        "SELECT user_type_id FROM cpay.user_types WHERE user_type_name ILIKE $1 LIMIT 1",
        [typeName]
    );
    const userTypeId = typeRes.rows.length > 0 ? typeRes.rows[0].user_type_id : null;

    // Generate username from email
    const cleanMobile = mobileNumber.replace(/[^0-9]/g, '');
    const generatedUsername = username || (email ? email.split('@')[0] : `user_${cleanMobile}`);

    const query = `
        INSERT INTO cpay.users
        (
            user_id,
            role_id,
            user_type_id,
            username,
            email,
            mobile_number,
            password_hash,
            is_email_verified,
            is_mobile_verified,
            is_active,
            created_at,
            updated_at
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            FALSE,
            FALSE,
            TRUE,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        )
        RETURNING *;
    `;

    const result = await pool.query(query, [
        userId,
        roleId,
        userTypeId,
        generatedUsername,
        email,
        mobileNumber,
        passwordHash
    ]);

    return result.rows[0];

};

/*
====================================================
Valuator Details Repository Methods
====================================================
*/

export const createValuatorDetails = async (data) => {
    const {
        valuatorId,
        userId,
        name,
        address,
        licence,
        aadhaarNumber,
        panNumber,
        aadhaarFileName,
        panFileName,
        licenceFileName
    } = data;

    const query = `
        INSERT INTO cpay.valuator_details
        (
            valuator_id,
            user_id,
            name,
            address,
            licence,
            aadhaar_number,
            pan_number,
            aadhaar_file,
            pan_file,
            licence_file,
            is_approved,
            created_at,
            updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *;
    `;

    const result = await pool.query(query, [
        valuatorId,
        userId,
        name,
        address,
        licence,
        aadhaarNumber || null,
        panNumber || null,
        aadhaarFileName || null,
        panFileName || null,
        licenceFileName || null
    ]);
    return result.rows[0];
};

export const findValuatorByUserId = async (userId, mobileNumber) => {
    const query = `
        SELECT * FROM cpay.valuator_details
        WHERE user_id = $1
           OR (mobile_number IS NOT NULL AND mobile_number = $2)
           OR (user_id IS NULL AND mobile_number IS NOT NULL AND $2 IS NOT NULL AND mobile_number LIKE '%' || RIGHT($2, 10))
        ORDER BY created_at DESC
        LIMIT 1;
    `;
    const result = await pool.query(query, [userId, mobileNumber || '']);
    return result.rows[0];
};

export const findUserByEmail = async (email) => {
    const query = `
        SELECT u.user_id, u.role_id, u.email, u.mobile_number, u.password_hash, u.is_active, r.role_name
        FROM cpay.users u
        JOIN cpay.roles r ON u.role_id = r.role_id
        WHERE u.email = $1
        LIMIT 1;
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0];
};

export const getIndividualDetailsByUserId = async (userId) => {
    const query = `
        SELECT * FROM cpay.individual_details
        WHERE user_id = $1
        LIMIT 1;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
};

export const getOrganizationDetailsByUserId = async (userId) => {
    const query = `
        SELECT * FROM cpay.organization_details
        WHERE user_id = $1
        LIMIT 1;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
};


