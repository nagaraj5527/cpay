import { Router } from 'express';
import { validatePond, getPondsForAsset } from '../controllers/pond.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/validate', validatePond);
router.get('/asset/:landId', authenticateToken, getPondsForAsset);

export default router;
