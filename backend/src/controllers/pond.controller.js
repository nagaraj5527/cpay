import * as pondService from '../services/pond.service.js';

export async function validatePond(req, res, next) {
  try {
    const pondData = req.body;
    const validation = pondService.validatePondData(pondData);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Pond validation failed',
        errors: validation.errors
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Pond details are valid. Ready to add next pond.',
      data: pondData
    });
  } catch (err) {
    next(err);
  }
}

export async function getPondsForAsset(req, res, next) {
  try {
    const { landId } = req.params;
    if (!landId) {
      return res.status(400).json({
        success: false,
        message: 'Asset / Land ID is required'
      });
    }

    const ponds = await pondService.getPondsByLandId(landId);
    return res.status(200).json({
      success: true,
      data: ponds
    });
  } catch (err) {
    next(err);
  }
}
