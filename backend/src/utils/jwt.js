import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/*
==========================================
Generate JWT Token
==========================================
*/

export const generateToken = (user) => {

    return jwt.sign(

        {

            userId: user.user_id,

            roleId: user.role_id,

            mobileNumber: user.mobile_number

        },

        process.env.JWT_SECRET,

        {

            expiresIn: process.env.JWT_EXPIRES_IN

        }

    );

};

/*
==========================================
Verify JWT Token
==========================================
*/

export const verifyToken = (token) => {

    return jwt.verify(

        token,

        process.env.JWT_SECRET

    );

};