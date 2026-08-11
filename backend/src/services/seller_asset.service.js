import pool from '../config/postgres.js';
import { calculateAquacultureCarbon } from './aquaculture_calculator.service.js';

/*
========================================================
1. GET /seller/assets - Load Seller Assets with Aggregated KPIs
========================================================
*/
export const getSellerAssets = async (user) => {
    const query = `
        SELECT 
            r.registration_id AS "assetId",
            r.application_number AS "applicationNumber",
            COALESCE(ld.survey_number, 'N/A') AS "surveyNumber",
            COALESCE(ld.sub_division_number, '') AS "subDivisionNumber",
            CONCAT('Parcel ', COALESCE(ld.survey_number, 'N/A'), '/', COALESCE(ld.sub_division_number, '')) AS "assetName",
            r.application_status AS "status",
            COALESCE(r.remarks, '') AS "remarks",
            COALESCE(ld.total_area, r.total_area, 0) AS "totalArea",
            COALESCE(ld.total_production, r.total_production, 0) AS "totalProduction",
            COALESCE(ld.total_carbon_credits, r.total_carbon_credits, cc.carbon_credits, 0) AS "totalCredits",
            COALESCE(ld.portfolio_value, r.portfolio_value, cc.market_value, 0) AS "portfolioValue",
            ad.state_name AS "state",
            ad.district_name AS "district",
            ad.mandal_name AS "mandal",
            ad.village_name AS "village",
            ad.pincode AS "pincode",
            r.created_at AS "createdAt"
        FROM cpay.registration r
        LEFT JOIN cpay.land_details ld ON r.registration_id = ld.registration_id
        LEFT JOIN (
            SELECT ad_inner.*, s.state_name, d.district_name, m.mandal_name, v.village_name
            FROM cpay.address_details ad_inner
            LEFT JOIN cpay.states s ON ad_inner.state_id = s.state_id
            LEFT JOIN cpay.districts d ON ad_inner.district_id = d.district_id
            LEFT JOIN cpay.mandals m ON ad_inner.mandal_id = m.mandal_id
            LEFT JOIN cpay.villages v ON ad_inner.village_id = v.village_id
        ) ad ON r.registration_id = ad.registration_id
        LEFT JOIN cpay.carbon_calculation cc ON r.registration_id = cc.registration_id
        WHERE r.user_id = $1
        ORDER BY r.created_at DESC;
    `;
    const res = await pool.query(query, [user.userId]);
    const assets = await Promise.all(res.rows.map(async (row) => {
        let totalArea = Number(row.totalArea || 0);
        let totalCredits = Number(row.totalCredits || 0);
        let totalProduction = Number(row.totalProduction || 0);

        // 1. Check if ponds exist in cpay.ponds for this asset
        const pondsSumRes = await pool.query(
            `SELECT 
                SUM(p.pond_area) AS sum_area,
                SUM(COALESCE(pp.production, 0)) AS sum_production,
                SUM(COALESCE(pc.carbon_credit, pc.co2_reduction, 0)) AS sum_credits
             FROM cpay.ponds p
             LEFT JOIN cpay.aquaculture_surveys s ON p.survey_id = s.survey_id
             LEFT JOIN cpay.pond_carbon_calculation pc ON p.pond_id = pc.pond_id
             LEFT JOIN cpay.pond_production pp ON p.pond_id = pp.pond_id
             WHERE s.registration_id = $1 OR s.asset_id = $1 OR p.land_id = $1 OR p.land_id IN (SELECT land_id FROM cpay.land_details WHERE registration_id = $1);`,
            [row.assetId]
        );

        if (pondsSumRes.rows.length > 0 && Number(pondsSumRes.rows[0].sum_production) > 0) {
            totalArea = Number(pondsSumRes.rows[0].sum_area || totalArea);
            totalProduction = Number(pondsSumRes.rows[0].sum_production);
            totalCredits = Number(Number(pondsSumRes.rows[0].sum_credits).toFixed(2));
        } else if (totalArea === 0 || totalCredits === 0 || totalProduction === 0) {
            const aquaRes = await pool.query(
                `SELECT aq.*, f.species_name as fish_name, p.species_name as prawn_name
                 FROM cpay.aquaculture_details aq
                 LEFT JOIN cpay.fish_species f ON aq.fish_species_id = f.fish_species_id
                 LEFT JOIN cpay.prawn_species p ON aq.prawn_species_id = p.prawn_species_id
                 WHERE aq.registration_id = $1;`,
                [row.assetId]
            );
            if (aquaRes.rows.length > 0) {
                let sumArea = 0;
                let sumProd = 0;
                let sumCredits = 0;
                aquaRes.rows.forEach(aqRow => {
                    const pArea = Number(aqRow.pond_area || 0);
                    sumArea += pArea;
                    try {
                        const calc = calculateAquacultureCarbon({
                            pond_area_ha: pArea,
                            species_name: aqRow.fish_name || aqRow.prawn_name || 'IMC',
                            crops_per_year: aqRow.crops_per_year || 1.5,
                            stocking_density: aqRow.stock_quantity ? Number(aqRow.stock_quantity) : undefined,
                            farm_reported_fcr: aqRow.fcr ? Number(aqRow.fcr) : undefined,
                            total_feed_required_kg: aqRow.feed_consumed ? Number(aqRow.feed_consumed) : undefined
                        });
                        if (calc) {
                            sumProd += Math.round(calc.total_production_kg);
                            sumCredits += Number(calc.carbon_credit_per_year_t.toFixed(2));
                        }
                    } catch (e) {}
                });
                if (totalArea === 0) totalArea = sumArea;
                if (totalProduction === 0) totalProduction = sumProd;
                if (totalCredits === 0) totalCredits = Number(sumCredits.toFixed(2));
            }
        }

        const portfolioValue = Math.round(totalCredits * 120);

        return {
            ...row,
            totalArea,
            totalProduction,
            totalCredits,
            portfolioValue
        };
    }));

    return { success: true, data: assets };
};

/*
========================================================
2. GET /seller/assets/:assetId/ponds - Expand Asset & Inherit Status
========================================================
*/
export const getAssetPonds = async (user, assetId) => {
    // 1. Load Asset Master Status & Summary
    const assetRes = await pool.query(
        `SELECT r.registration_id AS "assetId", r.application_status AS "status", ld.survey_number
         FROM cpay.registration r
         LEFT JOIN cpay.land_details ld ON r.registration_id = ld.registration_id
         WHERE (r.registration_id = $1 OR ld.land_id = $1) AND r.user_id = $2
         LIMIT 1;`,
        [assetId, user.userId]
    );

    if (assetRes.rows.length === 0) {
        return { success: false, message: "Asset not found or access denied" };
    }

    const masterAsset = assetRes.rows[0];
    const assetStatus = masterAsset.status === 'VERIFIED_CORRECT' ? 'Verified' :
                        masterAsset.status === 'VERIFIED_WRONG' ? 'Rejected' :
                        masterAsset.status === 'RESUBMISSION_REQUIRED' ? 'Under Review' : 'Pending';

    // 2. Fetch Ponds under Survey / Land / Registration
    const pondsRes = await pool.query(
        `SELECT p.pond_id AS "pondId",
                p.pond_number AS "pond",
                p.pond_name AS "pondName",
                p.species AS "species",
                p.pond_area AS "area",
                COALESCE(pc.co2_reduction, 0) AS "co2Reduction",
                COALESCE(pc.carbon_credit, 0) AS "credits",
                COALESCE(pc.portfolio_value, 0) AS "portfolioValue",
                COALESCE(pp.production, 0) AS "production"
         FROM cpay.ponds p
         LEFT JOIN cpay.aquaculture_surveys s ON p.survey_id = s.survey_id
         LEFT JOIN cpay.pond_carbon_calculation pc ON p.pond_id = pc.pond_id
         LEFT JOIN cpay.pond_production pp ON p.pond_id = pp.pond_id
         WHERE s.registration_id = $1 OR s.asset_id = $1 OR p.land_id = $1 OR p.land_id IN (SELECT land_id FROM cpay.land_details WHERE registration_id = $1)
         ORDER BY p.pond_number ASC;`,
        [assetId]
    );

    let pondsData = pondsRes.rows;
    if (pondsData.length === 0) {
        const aquaRes = await pool.query(
            `SELECT aq.aquaculture_id AS "pondId",
                    aq.pond_area AS "area",
                    aq.remarks,
                    aq.stock_quantity,
                    aq.culture_days,
                    aq.feed_consumed,
                    aq.fcr,
                    aq.crops_per_year,
                    aq_fish.species_name as fish_name,
                    aq_prawn.species_name as prawn_name,
                    aq.aquaculture_type
             FROM cpay.aquaculture_details aq
             LEFT JOIN cpay.fish_species aq_fish ON aq.fish_species_id = aq_fish.fish_species_id
             LEFT JOIN cpay.prawn_species aq_prawn ON aq.prawn_species_id = aq_prawn.prawn_species_id
             WHERE aq.registration_id = $1 OR aq.land_id = $1 OR aq.land_id IN (SELECT land_id FROM cpay.land_details WHERE registration_id = $1);`,
            [assetId]
        );
        if (aquaRes.rows.length > 0) {
            pondsData = aquaRes.rows.map((row, idx) => {
                let pName = `Pond ${idx + 1}`;
                let pSpecies = row.fish_name || row.prawn_name || row.aquaculture_type || 'IMC';
                if (row.remarks && row.remarks.includes('Survey Pond:')) {
                    const match = row.remarks.match(/Survey Pond:\s*([^|]+)/);
                    if (match && match[1]) pName = match[1].trim();
                    const specMatch = row.remarks.match(/Species:\s*([^|]+)/);
                    if (specMatch && specMatch[1] && specMatch[1].trim().toLowerCase() !== 'neem') pSpecies = specMatch[1].trim();
                }
                const pAreaNum = parseFloat(row.area) || 1.0;
                let calc = null;
                try {
                    calc = calculateAquacultureCarbon({
                        pond_area_ha: pAreaNum,
                        species_name: pSpecies,
                        crops_per_year: row.crops_per_year || 1.5,
                        stocking_density: row.stock_quantity ? Number(row.stock_quantity) : undefined,
                        farm_reported_fcr: row.fcr ? Number(row.fcr) : undefined,
                        total_feed_required_kg: row.feed_consumed ? Number(row.feed_consumed) : undefined
                    });
                } catch (e) {}

                const credits = calc ? parseFloat(calc.carbon_credit_per_year_t.toFixed(2)) : parseFloat((pAreaNum * 6.8).toFixed(2));
                const production = calc ? Math.round(calc.total_production_kg) : Math.round(pAreaNum * 7500);
                const portfolioValue = Math.round(credits * 120);

                return {
                    pondId: row.pondId,
                    pond: idx + 1,
                    pondName: pName,
                    species: pSpecies,
                    area: pAreaNum,
                    co2Reduction: credits,
                    credits: credits,
                    portfolioValue: portfolioValue,
                    production: production
                };
            });
        }
    }

    // 3. Dynamically inherit status from Asset (Single Source of Truth)
    const pondsWithInheritedStatus = pondsData.map(pond => ({
        ...pond,
        status: assetStatus
    }));

    return {
        success: true,
        asset: {
            assetId: masterAsset.assetId,
            surveyNumber: masterAsset.survey_number,
            status: assetStatus
        },
        ponds: pondsWithInheritedStatus
    };
};

/*
========================================================
3. Recalculate and Aggregate Asset Summary Values in Database
========================================================
*/
export const recalculateAssetSummary = async (client, assetId) => {
    // Calculate SUMs across ponds
    const sumRes = await client.query(
        `SELECT 
            COALESCE(SUM(p.pond_area), 0) AS total_area,
            COALESCE(SUM(pp.production), 0) AS total_production,
            COALESCE(SUM(pc.carbon_credit), 0) AS total_credits,
            COALESCE(SUM(pc.portfolio_value), 0) AS portfolio_value
         FROM cpay.aquaculture_surveys s
         JOIN cpay.ponds p ON s.survey_id = p.survey_id
         LEFT JOIN cpay.pond_production pp ON p.pond_id = pp.pond_id
         LEFT JOIN cpay.pond_carbon_calculation pc ON p.pond_id = pc.pond_id
         WHERE s.registration_id = $1 OR s.asset_id = $1;`,
        [assetId]
    );

    const agg = sumRes.rows[0];

    // Update land_details summary
    await client.query(
        `UPDATE cpay.land_details
         SET total_area = $1,
             total_production = $2,
             total_carbon_credits = $3,
             portfolio_value = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE registration_id = $5`,
        [agg.total_area, agg.total_production, agg.total_credits, agg.portfolio_value, assetId]
    );

    // Update registration summary
    await client.query(
        `UPDATE cpay.registration
         SET total_area = $1,
             total_production = $2,
             total_carbon_credits = $3,
             portfolio_value = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE registration_id = $5`,
        [agg.total_area, agg.total_production, agg.total_credits, agg.portfolio_value, assetId]
    );

    return agg;
};
