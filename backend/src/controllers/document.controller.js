import pool from '../config/postgres.js';

// Upload a document (Aadhaar, PAN, Signature, GST, LAND_PHOTO, etc.)
export const uploadDocument = async (req, res) => {
    try {
        const { registrationId, documentType } = req.body;
        let fileBuffer = req.file ? req.file.buffer : null;
        let filename = req.file ? req.file.originalname : (req.body.filename || `${documentType}.jpg`);
        let mimetype = req.file ? req.file.mimetype : 'image/jpeg';

        if (!registrationId || !documentType) {
            return res.status(400).json({
                success: false,
                message: 'registrationId and documentType are required'
            });
        }

        if (!fileBuffer && req.body.base64Data) {
            const base64Str = req.body.base64Data;
            const matches = base64Str.match(/^data:(.+);base64,(.+)$/);
            if (matches) {
                mimetype = matches[1];
                fileBuffer = Buffer.from(matches[2], 'base64');
            } else {
                fileBuffer = Buffer.from(base64Str, 'base64');
            }
        }

        if (!fileBuffer) {
            return res.status(400).json({
                success: false,
                message: 'No file or base64Data provided'
            });
        }

        // Save or update in PostgreSQL cpay.documents table
        const typeUpper = documentType.toUpperCase();
        await pool.query(
            `INSERT INTO cpay.documents (registration_id, document_type, filename, content_type, data, uploaded_at)
             VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
             ON CONFLICT (registration_id, document_type)
             DO UPDATE SET filename = EXCLUDED.filename, content_type = EXCLUDED.content_type, data = EXCLUDED.data, uploaded_at = CURRENT_TIMESTAMP`,
            [registrationId, typeUpper, filename, mimetype, fileBuffer]
        );

        return res.status(200).json({
            success: true,
            message: `${documentType} uploaded successfully`,
            filename: filename
        });
    } catch (error) {
        console.error('❌ Error uploading document to PostgreSQL:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to upload document',
            error: error.message
        });
    }
};

// Retrieve binary document content
export const getDocument = async (req, res) => {
    try {
        const { registrationId, documentType } = req.params;
        const typeUpper = documentType.toUpperCase();
        const cleanMobile = registrationId.replace(/[^0-9]/g, '').slice(-10);

        const docRes = await pool.query(
            `SELECT filename, content_type, data FROM cpay.documents
             WHERE (
               registration_id = $1
               OR registration_id IN (SELECT registration_id::text FROM cpay.registration r JOIN cpay.users u ON r.user_id = u.user_id WHERE u.mobile_number = $1 OR u.mobile_number = $2 OR u.mobile_number = $3)
               OR registration_id IN (SELECT user_id::text FROM cpay.users WHERE mobile_number = $1 OR mobile_number = $2 OR mobile_number = $3)
             ) AND (document_type = $4 OR ($4 = 'LAND' AND document_type = 'LAND_PHOTO') OR ($4 = 'LAND_PHOTO' AND document_type = 'LAND'))
             ORDER BY uploaded_at DESC LIMIT 1`,
            [registrationId, cleanMobile, '+91' + cleanMobile, typeUpper]
        );

        if (docRes.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Document of type ${documentType} not found`
            });
        }

        const doc = docRes.rows[0];
        res.set('Content-Type', doc.content_type || 'image/jpeg');
        res.set('Content-Disposition', `inline; filename="${doc.filename}"`);
        return res.send(doc.data);
    } catch (error) {
        console.error('❌ Error retrieving document from PostgreSQL:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve document',
            error: error.message
        });
    }
};

// Upload user profile photo
export const uploadProfilePhoto = async (req, res) => {
    try {
        const file = req.file;
        const userId = req.user.userId;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'No profile photo uploaded'
            });
        }

        // Store profile photo with registration_id as user's userId and document_type = 'PROFILE_PHOTO'
        await pool.query(
            `INSERT INTO cpay.documents (registration_id, document_type, filename, content_type, data, uploaded_at)
             VALUES ($1, 'PROFILE_PHOTO', $2, $3, $4, CURRENT_TIMESTAMP)
             ON CONFLICT (registration_id, document_type)
             DO UPDATE SET filename = EXCLUDED.filename, content_type = EXCLUDED.content_type, data = EXCLUDED.data, uploaded_at = CURRENT_TIMESTAMP`,
            [userId, file.originalname, file.mimetype, file.buffer]
        );

        return res.status(200).json({
            success: true,
            message: 'Profile photo uploaded successfully',
            filename: file.originalname
        });
    } catch (error) {
        console.error('❌ Error uploading profile photo to PostgreSQL:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to upload profile photo',
            error: error.message
        });
    }
};

// Get user profile photo (public/sessionless route using mobile number or userId)
export const getProfilePhoto = async (req, res) => {
    try {
        const { mobile } = req.params;

        const cleanMobile = mobile.replace(/[^0-9]/g, '').slice(-10);
        let userId = mobile;

        // Look up the userId in PostgreSQL if available
        const userRes = await pool.query(
            "SELECT user_id FROM cpay.users WHERE mobile_number = $1 OR mobile_number = $2 OR mobile_number = $3 LIMIT 1",
            [mobile, cleanMobile, '+91' + cleanMobile]
        );
        if (userRes.rows.length > 0) {
            userId = userRes.rows[0].user_id;
        }

        const docRes = await pool.query(
            `SELECT filename, content_type, data FROM cpay.documents
             WHERE (registration_id = $1 OR registration_id = $2 OR registration_id = $3)
               AND document_type = 'PROFILE_PHOTO'
             ORDER BY uploaded_at DESC LIMIT 1`,
            [userId, mobile, cleanMobile]
        );

        if (docRes.rows.length === 0) {
            return res.status(204).end();
        }

        const doc = docRes.rows[0];
        res.set('Content-Type', doc.content_type);
        res.set('Content-Disposition', `inline; filename="${doc.filename}"`);
        return res.send(doc.data);
    } catch (error) {
        console.error('❌ Error retrieving profile photo from PostgreSQL:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve profile photo',
            error: error.message
        });
    }
};

// Get status list of uploaded documents (returns filename and size, but not raw data)
export const getDocumentStatusList = async (req, res) => {
    try {
        const { registrationId } = req.params;

        const docsRes = await pool.query(
            `SELECT document_type, filename, uploaded_at FROM cpay.documents
             WHERE registration_id = $1 AND document_type != 'PROFILE_PHOTO'`,
            [registrationId]
        );

        const statusMap = {};
        docsRes.rows.forEach(doc => {
            statusMap[doc.document_type] = {
                filename: doc.filename,
                uploadedAt: doc.uploaded_at
            };
        });

        return res.status(200).json({
            success: true,
            documents: statusMap
        });
    } catch (error) {
        console.error('❌ Error getting document status list from PostgreSQL:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve document status',
            error: error.message
        });
    }
};
