import { asyncHandler } from '../utils/asyncHandler.js';
import * as walletService from '../services/wallet.service.js';

/*
====================================================
1. GET /api/wallet - Get User Wallet & Transactions
====================================================
*/
export const getWalletData = asyncHandler(async (req, res) => {
    const result = await walletService.getWalletData(req.user);
    return res.status(200).json(result);
});

/*
====================================================
2. POST /api/wallet/trade - Execute Credit Trade
====================================================
*/
export const executeTrade = asyncHandler(async (req, res) => {
    const result = await walletService.executeTrade(req.user, req.body);
    return res.status(200).json(result);
});
