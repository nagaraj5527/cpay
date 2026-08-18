import pool from '../config/postgres.js';
import { calculateTreeMangroveCarbon } from '../services/tree_mangrove_calculator.service.js';

/**
 * Calculate Tree & Mangrove Carbon Sequestration
 * POST /api/carbon/calculate-tree-mangrove
 */
export const calculateTreeMangrove = async (req, res) => {
    try {
        const calculationResult = calculateTreeMangroveCarbon(req.body);
        return res.status(200).json({
            success: true,
            data: calculationResult
        });
    } catch (error) {
        console.error('❌ Error calculating Tree & Mangrove carbon:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to calculate tree & mangrove carbon sequestration',
            error: error.message
        });
    }
};

/**
 * Save Tree & Mangrove Carbon Calculation to PostgreSQL cpay.tree_mangrove_carbon_calculations
 * POST /api/carbon/save-tree-mangrove
 */
export const saveTreeMangroveCalculation = async (req, res) => {
    try {
        const {
            registrationId,
            landId,
            landType = 'Open Land',
            smallTreeCount = 0,
            mediumTreeCount = 0,
            largeTreeCount = 0,
            mangroveAreaHa = 0,
            biomassFactor = 1.00,
            creditRateInr = 120
        } = req.body;

        if (!registrationId) {
            return res.status(400).json({
                success: false,
                message: 'registrationId is required'
            });
        }

        const calc = calculateTreeMangroveCarbon({
            landType,
            smallTreeCount,
            mediumTreeCount,
            largeTreeCount,
            mangroveAreaHa,
            biomassFactor,
            creditRateInr
        });

        const queryText = `
            INSERT INTO cpay.tree_mangrove_carbon_calculations (
                registration_id,
                land_id,
                land_type,
                small_tree_count,
                medium_tree_count,
                large_tree_count,
                mangrove_area_ha,
                biomass_factor,
                tree_co2e_tonnes,
                mangrove_co2e_tonnes,
                total_co2e_tonnes,
                total_carbon_credits,
                market_value_inr,
                created_at,
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING calculation_id;
        `;

        const values = [
            registrationId,
            landId || null,
            landType,
            smallTreeCount,
            mediumTreeCount,
            largeTreeCount,
            mangroveAreaHa,
            biomassFactor,
            calc.summary.totalTreesCO2eTonnes,
            calc.summary.totalMangroveCO2eTonnes,
            calc.summary.totalCO2eStoredTonnes,
            calc.summary.totalCarbonCredits,
            calc.summary.portfolioValueInr
        ];

        const dbRes = await pool.query(queryText, values);

        return res.status(200).json({
            success: true,
            message: 'Tree & Mangrove carbon calculation saved successfully to PostgreSQL',
            calculationId: dbRes.rows[0]?.calculation_id,
            calculation: calc
        });
    } catch (error) {
        console.error('❌ Error saving Tree & Mangrove calculation:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to save Tree & Mangrove carbon calculation',
            error: error.message
        });
    }
};

/**
 * Get Tree & Mangrove Carbon Calculation by Registration ID
 * GET /api/carbon/tree-mangrove/:registrationId
 */
export const getTreeMangroveCalculation = async (req, res) => {
    try {
        const { registrationId } = req.params;
        const cleanMobile = registrationId.replace(/[^0-9]/g, '').slice(-10);

        const dbRes = await pool.query(
            `SELECT * FROM cpay.tree_mangrove_carbon_calculations
             WHERE registration_id = $1
                OR registration_id = $2
                OR registration_id = $3
             ORDER BY created_at DESC LIMIT 1`,
            [registrationId, cleanMobile, '+91' + cleanMobile]
        );

        if (dbRes.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No Tree & Mangrove carbon calculation found for registration'
            });
        }

        const row = dbRes.rows[0];
        const calc = calculateTreeMangroveCarbon({
            landType: row.land_type,
            smallTreeCount: row.small_tree_count,
            mediumTreeCount: row.medium_tree_count,
            largeTreeCount: row.large_tree_count,
            mangroveAreaHa: row.mangrove_area_ha,
            biomassFactor: row.biomass_factor
        });

        return res.status(200).json({
            success: true,
            data: {
                calculationId: row.calculation_id,
                registrationId: row.registration_id,
                createdAt: row.created_at,
                ...calc
            }
        });
    } catch (error) {
        console.error('❌ Error fetching Tree & Mangrove calculation:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch Tree & Mangrove carbon calculation',
            error: error.message
        });
    }
};
