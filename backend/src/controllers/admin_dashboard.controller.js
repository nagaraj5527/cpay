import * as adminService from '../services/admin_dashboard.service.js';

export const getDashboard = async (req, res) => {
    try {
        const result = await adminService.getDashboardSummary();
        return res.status(200).json(result);
    } catch (error) {
        console.error("Admin Dashboard Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

export const getUsers = async (req, res) => {
    try {
        const result = await adminService.getUsers();
        return res.status(200).json(result);
    } catch (error) {
        console.error("Admin Get Users Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

export const getAuditLogs = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 50;
        const result = await adminService.getAuditLogs(limit);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Admin Get Audit Logs Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

export const globalSearch = async (req, res) => {
    try {
        const query = req.query.q || req.query.query || '';
        const result = await adminService.globalSearch(query);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Global Search Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

export const getSettings = async (req, res) => {
    try {
        const result = await adminService.getSettings();
        return res.status(200).json(result);
    } catch (error) {
        console.error("Get Settings Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

export const updateSetting = async (req, res) => {
    try {
        const { key, value } = req.body;
        const result = await adminService.updateSetting(key, value, req.user?.userId);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Update Setting Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};
