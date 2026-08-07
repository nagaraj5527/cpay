import express from 'express';
import * as valuatorController from '../controllers/valuator.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

const valuatorRole = 'e89456bc-365a-493e-bc5d-df12b694b8e2';

// Apply authenticate and authorize to all routes in this router
router.use(authenticate);
router.use(authorize(valuatorRole));

router.get('/registrations', valuatorController.getRegistrations);
router.get('/registrations/:registrationId', valuatorController.getRegistrationDetails);
router.post('/registrations/:registrationId/evaluate', valuatorController.evaluateRegistration);
router.get('/pincode-users/:pincode', valuatorController.getPincodeUsers);

export default router;
