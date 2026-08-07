import express from 'express';
import * as sellerAssetController from '../controllers/seller_asset.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

/*
========================================================
Seller Asset Management & Verification APIs
========================================================
*/

// GET /seller/assets - Fetch all seller assets with pre-aggregated KPIs
router.get(
    '/assets',
    authenticate,
    sellerAssetController.getSellerAssets
);

// GET /seller/assets/:assetId/ponds - Expand asset & fetch child ponds inheriting master status
router.get(
    '/assets/:assetId/ponds',
    authenticate,
    sellerAssetController.getAssetPonds
);

export default router;
