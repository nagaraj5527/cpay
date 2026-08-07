import * as aquacultureService from '../services/aquaculture.service.js';

export const createSurvey = async (req, res) => {
    try {
        const result = await aquacultureService.createSurvey(req.user, req.body);
        return res.status(201).json(result);
    } catch (error) {
        console.error("Create Survey Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

export const getSurvey = async (req, res) => {
    try {
        const { surveyId } = req.params;
        const result = await aquacultureService.getSurveySummary(surveyId);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Get Survey Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

export const savePond = async (req, res) => {
    try {
        const result = await aquacultureService.savePond(req.user, req.body);
        return res.status(201).json(result);
    } catch (error) {
        console.error("Save Pond Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

export const getPondsBySurvey = async (req, res) => {
    try {
        const { surveyId } = req.params;
        const result = await aquacultureService.getPondsBySurvey(surveyId);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Get Ponds Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

export const calculateSurveyCarbon = async (req, res) => {
    try {
        const { surveyId } = req.params;
        const result = await aquacultureService.calculateSurveyCarbon(surveyId);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Calculate Survey Carbon Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

export const getSurveySummary = async (req, res) => {
    try {
        const { surveyId } = req.params;
        const result = await aquacultureService.getSurveySummary(surveyId);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Get Survey Summary Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};
