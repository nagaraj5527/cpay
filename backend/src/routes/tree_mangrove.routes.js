import express from 'express';
import {
    calculateTreeMangrove,
    saveTreeMangroveCalculation,
    getTreeMangroveCalculation
} from '../controllers/tree_mangrove.controller.js';

const router = express.Router();

router.post('/calculate-tree-mangrove', calculateTreeMangrove);
router.post('/save-tree-mangrove', saveTreeMangroveCalculation);
router.get('/tree-mangrove/:registrationId', getTreeMangroveCalculation);

export default router;
