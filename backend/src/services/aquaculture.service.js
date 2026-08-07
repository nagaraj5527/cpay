import pool from '../config/postgres.js';
import { calculateAquacultureCarbon } from './aquaculture_calculator.service.js';

/*
========================================================
1. Create or Initialize Aquaculture Survey
========================================================
*/
export const createSurvey = async (user, data) => {
    const { assetId, registrationId, cultureType, totalWaterArea, totalPonds } = data;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const regId = registrationId || assetId;
        const res = await client.query(
            `INSERT INTO cpay.aquaculture_surveys
             (asset_id, registration_id, culture_type, total_water_area, total_ponds, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING survey_id, culture_type, total_water_area, total_ponds, created_at`,
            [assetId || null, regId || null, cultureType || 'Aquaculture', Number(totalWaterArea || 1.0), Number(totalPonds || 1)]
        );

        await client.query('COMMIT');
        return { success: true, data: res.rows[0] };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

/*
========================================================
2. Create Pond with Sub-Details in Single Transaction
========================================================
*/
export const savePond = async (user, data) => {
    const {
        surveyId,
        pondNumber,
        pondName,
        species,
        pondArea,
        cultureType,
        stocking,
        growth,
        feed,
        waterQuality,
        harvest,
        production,
        sustainability
    } = data;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check if survey exists
        let sId = surveyId;
        if (!sId) {
            const newSurv = await client.query(
                `INSERT INTO cpay.aquaculture_surveys (culture_type, total_water_area, total_ponds)
                 VALUES ($1, $2, 1) RETURNING survey_id`,
                [cultureType || 'Aquaculture', Number(pondArea || 1.0)]
            );
            sId = newSurv.rows[0].survey_id;
        }

        // Determine next pond_number if not passed
        let pNum = Number(pondNumber);
        if (!pNum || isNaN(pNum)) {
            const maxRes = await client.query(
                `SELECT COALESCE(MAX(pond_number), 0) + 1 AS next_num FROM cpay.ponds WHERE survey_id = $1`,
                [sId]
            );
            pNum = Number(maxRes.rows[0].next_num);
        }

        // Insert Pond
        const pName = pondName || `Pond ${pNum}`;
        const pondRes = await client.query(
            `INSERT INTO cpay.ponds
             (survey_id, pond_number, pond_name, species, pond_area, culture_type, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, 'DRAFT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING pond_id, survey_id, pond_number, pond_name, species, pond_area, culture_type, status`,
            [sId, pNum, pName, species || 'IMC', Number(pondArea || 1.0), cultureType || 'Fish']
        );
        const pondId = pondRes.rows[0].pond_id;

        // Stocking Details
        if (stocking) {
            await client.query(
                `INSERT INTO cpay.pond_stocking_details
                 (pond_id, stocking_date, stocking_density, seed_source, seed_size, survival_rate)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [pondId, stocking.stockingDate || null, Number(stocking.stockingDensity || stocking.density || 6250), stocking.seedSource || 'Certified Hatchery', Number(stocking.seedSize || 150), Number(stocking.survivalRate || 85)]
            );
        }

        // Growth Details
        if (growth) {
            await client.query(
                `INSERT INTO cpay.pond_growth_details
                 (pond_id, culture_duration, average_weight, growth_rate, fcr)
                 VALUES ($1, $2, $3, $4, $5)`,
                [pondId, Number(growth.cultureDuration || 240), Number(growth.averageWeight || 1500), Number(growth.growthRate || 5.5), Number(growth.fcr || 1.2)]
            );
        }

        // Feed Details
        if (feed) {
            await client.query(
                `INSERT INTO cpay.pond_feed_details
                 (pond_id, feed_type, daily_feed, total_feed, feed_supplier)
                 VALUES ($1, $2, $3, $4, $5)`,
                [pondId, feed.feedType || 'Floating Pellets', Number(feed.daily_feed || 50), Number(feed.total_feed || feed.totalFeed || 3000), feed.feedSupplier || 'Standard Agro']
            );
        }

        // Water Quality
        if (waterQuality) {
            await client.query(
                `INSERT INTO cpay.pond_water_quality
                 (pond_id, temperature, ph, dissolved_oxygen, salinity, ammonia, nitrite)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [pondId, Number(waterQuality.temperature || 28), Number(waterQuality.ph || 7.5), Number(waterQuality.do || waterQuality.dissolved_oxygen || 6.5), Number(waterQuality.salinity || 0), Number(waterQuality.ammonia || 0.02), Number(waterQuality.nitrite || 0.01)]
            );
        }

        // Harvest Details
        if (harvest) {
            await client.query(
                `INSERT INTO cpay.pond_harvest_details
                 (pond_id, harvest_date, harvest_weight, survival_percent)
                 VALUES ($1, $2, $3, $4)`,
                [pondId, harvest.harvestDate || null, Number(harvest.harvestWeight || 7500), Number(harvest.survivalPercent || 85)]
            );
        }

        // Production Details
        if (production) {
            await client.query(
                `INSERT INTO cpay.pond_production
                 (pond_id, production, yield_per_hectare, biomass)
                 VALUES ($1, $2, $3, $4)`,
                [pondId, Number(production.production || 7500), Number(production.yieldPerHectare || 18500), Number(production.biomass || 7500)]
            );
        }

        // Sustainability
        if (sustainability) {
            await client.query(
                `INSERT INTO cpay.pond_sustainability
                 (pond_id, renewable_energy, water_recycling, feed_management, chemical_usage)
                 VALUES ($1, $2, $3, $4, $5)`,
                [pondId, sustainability.renewableEnergy || 'Solar Aerators', sustainability.waterRecycling || 'RAS Filtered', sustainability.feedManagement || 'Auto Feeders', sustainability.chemicalUsage || 'Zero Prohibited Chemicals']
            );
        }

        // Update Survey total ponds and water area
        await client.query(
            `UPDATE cpay.aquaculture_surveys
             SET total_ponds = (SELECT COUNT(*) FROM cpay.ponds WHERE survey_id = $1),
                 total_water_area = (SELECT COALESCE(SUM(pond_area), 0) FROM cpay.ponds WHERE survey_id = $1),
                 updated_at = CURRENT_TIMESTAMP
             WHERE survey_id = $1`,
            [sId]
        );

        await client.query('COMMIT');
        return {
            success: true,
            message: "Pond and sub-details saved cleanly inside single transaction",
            data: { ...pondRes.rows[0], surveyId: sId }
        };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

/*
========================================================
3. Get Ponds for Survey
========================================================
*/
export const getPondsBySurvey = async (surveyId) => {
    const res = await pool.query(
        `SELECT p.*, 
                pc.co2_reduction, pc.carbon_credit, pc.portfolio_value,
                ps.stocking_density, ps.survival_rate,
                pg.culture_duration, pg.fcr,
                pf.total_feed,
                pp.production
         FROM cpay.ponds p
         LEFT JOIN cpay.pond_carbon_calculation pc ON p.pond_id = pc.pond_id
         LEFT JOIN cpay.pond_stocking_details ps ON p.pond_id = ps.pond_id
         LEFT JOIN cpay.pond_growth_details pg ON p.pond_id = pg.pond_id
         LEFT JOIN cpay.pond_feed_details pf ON p.pond_id = pf.pond_id
         LEFT JOIN cpay.pond_production pp ON p.pond_id = pp.pond_id
         WHERE p.survey_id = $1
         ORDER BY p.pond_number ASC`,
        [surveyId]
    );
    return { success: true, data: res.rows };
};

/*
========================================================
4. Calculate Per-Pond & Aggregate Survey Carbon Summary
========================================================
*/
export const calculateSurveyCarbon = async (surveyId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Fetch all ponds for this survey
        const pRes = await client.query(
            `SELECT p.*, 
                    ps.stocking_density,
                    pg.culture_duration, pg.fcr,
                    pf.total_feed,
                    pp.production
             FROM cpay.ponds p
             LEFT JOIN cpay.pond_stocking_details ps ON p.pond_id = ps.pond_id
             LEFT JOIN cpay.pond_growth_details pg ON p.pond_id = pg.pond_id
             LEFT JOIN cpay.pond_feed_details pf ON p.pond_id = pf.pond_id
             LEFT JOIN cpay.pond_production pp ON p.pond_id = pp.pond_id
             WHERE p.survey_id = $1`,
            [surveyId]
        );

        const ponds = pRes.rows;
        let totalCO2 = 0;
        let totalCredits = 0;
        let totalProd = 0;
        const marketRate = 120.00;

        for (const pond of ponds) {
            const aquaCalc = calculateAquacultureCarbon({
                culture_type: pond.species || 'IMC',
                pond_area_ha: Number(pond.pond_area || 1.0),
                stocking_density: Number(pond.stocking_density || 6250),
                culture_duration_days: Number(pond.culture_duration || 240),
                total_feed_required_kg: Number(pond.total_feed || 3000),
                actual_fcr_used: Number(pond.fcr || 1.2)
            });

            const co2Red = Number(aquaCalc.co2e_reduction_per_crop_t.toFixed(2));
            const credits = Number(aquaCalc.carbon_credit_per_year_t.toFixed(2));
            const credsPerHa = Number((credits / (pond.pond_area || 1.0)).toFixed(2));
            const portVal = Number((credits * marketRate).toFixed(2));
            const pondProd = Number(pond.production || Math.round((pond.total_feed || 3000) / (pond.fcr || 1.2)));

            totalCO2 += co2Red;
            totalCredits += credits;
            totalProd += pondProd;

            await client.query(
                `INSERT INTO cpay.pond_carbon_calculation
                 (pond_id, formula_version, co2_reduction, carbon_credit, credits_per_hectare, market_rate, portfolio_value, calculated_at)
                 VALUES ($1, 'v2.0', $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
                [pond.pond_id, co2Red, credits, credsPerHa, marketRate, portVal]
            );
        }

        const totalPortVal = Number((totalCredits * marketRate).toFixed(2));

        const sumRes = await client.query(
            `INSERT INTO cpay.survey_carbon_summary
             (survey_id, total_production, total_co2, total_credits, market_rate, portfolio_value, calculated_at)
             VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
             RETURNING *`,
            [surveyId, totalProd, totalCO2, totalCredits, marketRate, totalPortVal]
        );

        await client.query('COMMIT');
        return {
            success: true,
            summary: sumRes.rows[0],
            pondCalculationsCount: ponds.length
        };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

/*
========================================================
5. Get Survey Carbon Summary & Per-Pond Cards
========================================================
*/
export const getSurveySummary = async (surveyId) => {
    const sumRes = await pool.query(
        `SELECT * FROM cpay.survey_carbon_summary WHERE survey_id = $1 ORDER BY calculated_at DESC LIMIT 1`,
        [surveyId]
    );

    const pondsRes = await pool.query(
        `SELECT p.pond_id, p.pond_number, p.pond_name, p.species, p.pond_area,
                pc.co2_reduction, pc.carbon_credit, pc.portfolio_value
         FROM cpay.ponds p
         LEFT JOIN cpay.pond_carbon_calculation pc ON p.pond_id = pc.pond_id
         WHERE p.survey_id = $1
         ORDER BY p.pond_number ASC`,
        [surveyId]
    );

    return {
        success: true,
        summary: sumRes.rows[0] || null,
        ponds: pondsRes.rows
    };
};
