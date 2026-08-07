import * as sellerAssetService from '../services/seller_asset.service.js';

export const getSellerAssets = async (req, res) => {
    try {
        const result = await sellerAssetService.getSellerAssets(req.user);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Get Seller Assets Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

export const getAssetPonds = async (req, res) => {
    try {
        const { assetId } = req.params;
        const result = await sellerAssetService.getAssetPonds(req.user, assetId);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Get Asset Ponds Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};
