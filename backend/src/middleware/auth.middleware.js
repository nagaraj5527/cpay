import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../config/postgres.js';

dotenv.config();

/*
=====================================================
JWT Authentication Middleware
=====================================================
*/

export const authenticate = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {

            return res.status(401).json({

                success: false,

                message: "Authorization token is missing"

            });

        }

        if (!authHeader.startsWith("Bearer ")) {

            return res.status(401).json({

                success: false,

                message: "Invalid Authorization Header"

            });

        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(

            token,

            process.env.JWT_SECRET

        );

        req.user = decoded;

        // Auto-heal session if user was deleted (e.g. database reset)
        const userCheck = await pool.query(
            "SELECT user_id FROM cpay.users WHERE user_id = $1 LIMIT 1",
            [decoded.userId]
        );
        if (userCheck.rows.length === 0) {
            console.log(`⚠️ User session user_id ${decoded.userId} not found in database. Checking by mobile number for auto-healing...`);
            
            const mobile = decoded.mobileNumber || '9999999999';
            
            // Check if user exists by mobile number
            const mobileCheck = await pool.query(
                "SELECT user_id, role_id FROM cpay.users WHERE mobile_number = $1 LIMIT 1",
                [mobile]
            );
            
            if (mobileCheck.rows.length > 0) {
                const existingUser = mobileCheck.rows[0];
                console.log(`⚠️ User found in database with different user_id (${existingUser.user_id}). Mapping token to database user...`);
                req.user.userId = existingUser.user_id;
                req.user.roleId = existingUser.role_id;
            } else {
                console.log(`⚠️ User not found by mobile either. Inserting auto-healed user...`);
                const cleanMobile = mobile.replace(/[^0-9]/g, '');
                const email = null;
                const passwordHash = '$2b$10$dummyhashplaceholder';
                
                // Verify if roleId exists
                const roleCheck = await pool.query(
                    "SELECT role_id FROM cpay.roles WHERE role_id = $1 LIMIT 1",
                    [decoded.roleId]
                );
                let roleIdToUse = decoded.roleId;
                if (roleCheck.rows.length === 0) {
                    console.log(`⚠️ Role ID ${decoded.roleId} not found in database. Using default SELLER role.`);
                    roleIdToUse = 'f061f4e6-0c98-466d-a37c-121024948a84'; // SELLER role from seed.sql
                }

                const username = `user_${cleanMobile}`;

                await pool.query(
                    `INSERT INTO cpay.users 
                     (user_id, role_id, user_type_id, username, email, mobile_number, password_hash, is_email_verified, is_mobile_verified, is_active)
                     VALUES ($1, $2, (SELECT user_type_id FROM cpay.user_types LIMIT 1), $3, $4, $5, $6, FALSE, TRUE, TRUE)`,
                    [decoded.userId, roleIdToUse, username, email, mobile, passwordHash]
                );
                console.log(`✅ User session successfully auto-healed for ${mobile}`);
            }
        }

        next();

    } catch (error) {

        console.error("🔑 Auth Middleware Error:", error);

        return res.status(401).json({

            success: false,

            message: "Invalid or Expired Token"

        });

    }

};

/*
=====================================================
Role Authorization Middleware
=====================================================
*/

export const authorize = (...roles) => {

    return (req, res, next) => {

        if (!roles.includes(req.user.roleId)) {

            return res.status(403).json({

                success: false,

                message: "Access Denied"

            });

        }

        next();

    };

};

export const authenticateToken = authenticate;
export const authorizeRoles = authorize;