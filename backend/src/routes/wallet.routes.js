import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as walletController from '../controllers/wallet.controller.js';

const router = express.Router();

/*
====================================================
Wallet & Carbon Credit Trading APIs
====================================================
*/

// GET /api/wallet - Get Wallet Balances & Transactions
router.get('/', authenticate, walletController.getWalletData);

// POST /api/wallet/trade - Execute Carbon Credit Trade
router.post('/trade', authenticate, walletController.executeTrade);

export default router;
