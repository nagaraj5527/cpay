import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

const adminRole = '5c80088e-4162-4671-9fdb-b89a956cbb4f';

// Apply authenticate and authorize to all routes in this router
router.use(authenticate);
router.use(authorize(adminRole));

// Dashboard Summary & Charts APIs
router.get('/dashboard', dashboardController.getDashboardSummary);
router.get('/dashboard/cards', dashboardController.getDashboardCards);
router.get('/dashboard/charts', dashboardController.getDashboardCharts);
router.get('/dashboard/latest-registrations', dashboardController.getLatestRegistrations);
router.get('/dashboard/pending-approvals', dashboardController.getPendingApprovals);
router.get('/dashboard/top-districts', dashboardController.getTopDistricts);
router.get('/dashboard/recent-activities', dashboardController.getRecentActivities);

// Users Management
router.get('/users', adminController.getUsers);
router.post('/users', adminController.updateUser); // Create/update user route
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);

// Pending Approvals Queue (Sellers, Buyers, Auditors)
router.get('/pending-queue', adminController.getPendingQueue);
router.post('/pending-queue/:itemId/approve', adminController.approvePendingItem);
router.post('/pending-queue/:itemId/reject', adminController.rejectPendingItem);

// Registrations Management
router.get('/registrations', adminController.getRegistrations);
router.put('/registrations/:registrationId', adminController.updateRegistration);
router.delete('/registrations/:registrationId', adminController.deleteRegistration);

import * as adminDashboardController from '../controllers/admin_dashboard.controller.js';

// Super Admin Enterprise Dashboard APIs
router.get('/dashboard-v2', adminDashboardController.getDashboard);
router.get('/audit-logs', adminDashboardController.getAuditLogs);
router.get('/search', adminDashboardController.globalSearch);
router.get('/settings', adminDashboardController.getSettings);
router.put('/settings', adminDashboardController.updateSetting);

export default router;
