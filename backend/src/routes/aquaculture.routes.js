import express from 'express';
import * as aquacultureController from '../controllers/aquaculture.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

/*
========================================================
Aquaculture Enterprise APIs
========================================================
*/

// Create Aquaculture Survey
router.post(
    '/surveys',
    authenticate,
    aquacultureController.createSurvey
);

// Get Aquaculture Survey
router.get(
    '/surveys/:surveyId',
    authenticate,
    aquacultureController.getSurvey
);

// Save/Create Pond with sub-details inside single transaction
router.post(
    '/ponds',
    authenticate,
    aquacultureController.savePond
);

// Get all ponds for survey
router.get(
    '/surveys/:surveyId/ponds',
    authenticate,
    aquacultureController.getPondsBySurvey
);

// Perform per-pond carbon calculation and survey aggregation
router.post(
    '/carbon/calculate/:surveyId',
    authenticate,
    aquacultureController.calculateSurveyCarbon
);

// Get survey carbon summary
router.get(
    '/carbon/summary/:surveyId',
    authenticate,
    aquacultureController.getSurveySummary
);

export default router;
