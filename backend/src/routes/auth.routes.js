import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

/*
====================================================
Authentication APIs
====================================================
*/

// Send OTP
router.post('/send-otp', authController.sendOtp);

// Verify OTP
router.post('/verify-otp', authController.verifyOtp);

// Profile
router.get(
    '/profile',
    authenticate,
    authController.profile
);

// Logout
router.post(
    '/logout',
    authenticate,
    authController.logout
);

// Register Valuator
router.post('/register-valuator', authController.registerValuator);

// Admin Login
router.post('/admin-login', authController.adminLogin);

// Check Mobile Existence
router.get('/check-mobile/:mobileNumber', authController.checkMobile);

export default router;