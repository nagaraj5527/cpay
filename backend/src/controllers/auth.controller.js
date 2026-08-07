import * as authService from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/*
====================================================
Send OTP
POST : /api/auth/send-otp
====================================================
*/
export const sendOtp = asyncHandler(async (req, res) => {
    const result = await authService.sendOtp(req.body);
    return res.status(200).json(result);
});

/*
====================================================
Verify OTP
POST : /api/auth/verify-otp
====================================================
*/
export const verifyOtp = asyncHandler(async (req, res) => {
    const result = await authService.verifyOtp(req.body);
    return res.status(200).json(result);
});

/*
====================================================
Logout
POST : /api/auth/logout
====================================================
*/
export const logout = asyncHandler(async (req, res) => {
    const result = await authService.logout(req.body);
    return res.status(200).json(result);
});

/*
====================================================
Profile
GET : /api/auth/profile
====================================================
*/
export const profile = asyncHandler(async (req, res) => {
    const result = await authService.profile(req.user);
    return res.status(200).json(result);
});

/*
====================================================
Register Valuator
POST : /api/auth/register-valuator
====================================================
*/
export const registerValuator = asyncHandler(async (req, res) => {
    const result = await authService.registerValuator(req.body);
    return res.status(201).json(result);
});

/*
====================================================
Admin Login
POST : /api/auth/admin-login
====================================================
*/
export const adminLogin = asyncHandler(async (req, res) => {
    const result = await authService.adminLogin(req.body);
    return res.status(200).json(result);
});

/*
====================================================
Check Mobile Existence
GET : /api/auth/check-mobile/:mobileNumber
====================================================
*/
export const checkMobile = asyncHandler(async (req, res) => {
    const { mobileNumber } = req.params;
    const result = await authService.checkMobile(mobileNumber);
    return res.status(200).json(result);
});