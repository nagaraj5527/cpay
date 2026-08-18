import express from 'express';
import * as registrationController from '../controllers/registration.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

/*
=========================================================
Registration APIs
=========================================================
*/


// Start Registration
router.post(
    '/start',
    authenticate,
    registrationController.startRegistration
);

// Personal Details
router.post(
    '/personal-details',
    authenticate,
    registrationController.savePersonalDetails
);

router.post(
    '/organization-details',
    authenticate,
    registrationController.saveOrganizationDetails
);

router.post(
    '/government-details',
    authenticate,
    registrationController.saveGovernmentDetails
);

// Address Details
router.post(
    '/address-details',
    authenticate,
    registrationController.saveAddressDetails
);

// Land Details
router.post(
    '/land-details',
    authenticate,
    registrationController.saveLandDetails
);

// Plantation Details
router.post(
    '/plantation-details',
    authenticate,
    registrationController.savePlantationDetails
);

// Aquaculture Details
router.post(
    '/aquaculture-details',
    authenticate,
    registrationController.saveAquacultureDetails
);

// Carbon Calculation
router.post(
    '/carbon-calculation',
    authenticate,
    registrationController.saveCarbonCalculation
);

// Live Carbon Calculation (non-saving)
router.post(
    '/calculate-carbon-live',
    authenticate,
    registrationController.calculateCarbonLive
);

// Consent
router.post(
    '/consent',
    authenticate,
    registrationController.saveConsent
);

// Preview
router.get(
    '/preview/:registrationId',
    authenticate,
    registrationController.previewRegistration
);

// Sync and Get Parcels List
router.post(
    '/sync-parcels',
    authenticate,
    registrationController.syncParcels
);

router.get(
    '/sync-parcels/:registrationId',
    authenticate,
    registrationController.getParcelsList
);

// Current User's Active Registration
router.get(
    '/current',
    authenticate,
    registrationController.getUserRegistration
);

// Final Submit
router.post(
    '/submit',
    authenticate,
    registrationController.submitRegistration
);

// Consolidated Submission endpoint
router.post(
    '/submit-full',
    authenticate,
    registrationController.submitFullRegistration
);

// Free REST API: Pincode Lookup (India Post API Proxy)
router.get(
    '/pincode/:pincode',
    authenticate,
    registrationController.getPincodeDetails
);

// Free REST API: Weather Forecast (Open-Meteo API Integration)
router.get(
    '/weather/:registrationId',
    authenticate,
    registrationController.getLandWeather
);

// Get user's all assets
router.get(
    '/my-assets',
    authenticate,
    registrationController.getUserAssets
);

// Add a new asset registration
router.post(
    '/add-asset',
    authenticate,
    registrationController.addAsset
);

// Excel Report Data
router.get(
    '/report',
    authenticate,
    registrationController.getReport
);

router.get(
    '/report/:registrationId',
    authenticate,
    registrationController.getReport
);

// Submit Buyer Registration (persists directly to Postgres cpay.registration & cpay.individual_details)
router.post(
    '/submit-buyer',
    registrationController.submitBuyerRegistration
);

// Check duplicate survey number API
router.get(
    '/check-survey',
    authenticate,
    registrationController.checkSurvey
);

router.get(
    '/assets/check-survey',
    authenticate,
    registrationController.checkSurvey
);

// Ecosystem Standings API (Dynamic rankings for Top Buyers & Top Sellers)
router.get(
    '/ecosystem-standings',
    authenticate,
    registrationController.getEcosystemStandings
);

export default router;