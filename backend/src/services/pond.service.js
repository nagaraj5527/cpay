import { query } from '../config/postgres.js';
import { calculateAquacultureCarbon } from './aquaculture_calculator.service.js';

/**
 * Enterprise Multi-Pond Service
 * Manages child pond entities belonging to parent Asset (land_details)
 */

export async function createOrUpdatePonds(landId, pondsData = [], client = null) {
  if (!pondsData || !Array.isArray(pondsData) || pondsData.length === 0) {
    return [];
  }

  const savedPonds = [];

  for (let i = 0; i < pondsData.length; i++) {
    const p = pondsData[i];
    const pondNumber = p.pondNumber || p.pondNo || (i + 1);
    const pondName = p.name || p.pondName || `Pond ${pondNumber}`;
    const cultureType = p.cultureType || 'Fish Culture';
    const speciesName = p.selectedSpecies || p.speciesName || p.species || 'IMC';
    const pondAreaHa = Number(p.pondAreaHa || p.area || p.pondArea || 1.0);
    const unit = p.unit || 'Hectare';
    const stockingDensity = Number(p.stockingDensity || p.stockQuantity || p.quantity || 6250);
    const stockingWeightG = Number(p.stockingWeightG || 150);
    const finalHarvestWeightG = Number(p.finalHarvestWeightG || 1500);
    const cultureDurationDays = Number(p.cultureDurationDays || p.daysOfCulture || 240);
    const survivalFraction = Number(p.survivalFraction || 0.80);
    const actualFcr = Number(p.actualFcr || p.averageFcr || p.farmReportedFcr || 3.0);
    const improvedFcr = Number(p.improvedFcr || p.improvedFcrTarget || 2.5);
    const paddlewheelUnits = Number(p.paddlewheelUnits || 4);

    const upsertSql = `
      INSERT INTO cpay.ponds (
        pond_id,
        land_id,
        pond_number,
        pond_name,
        culture_type,
        species_name,
        pond_area_ha,
        unit,
        stocking_density,
        stocking_weight_g,
        final_harvest_weight_g,
        culture_duration_days,
        survival_fraction,
        actual_fcr,
        improved_fcr,
        paddlewheel_units,
        status,
        created_at,
        updated_at
      ) VALUES (
        uuid_generate_v4(),
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT (land_id, pond_number) DO UPDATE SET
        pond_name = EXCLUDED.pond_name,
        culture_type = EXCLUDED.culture_type,
        species_name = EXCLUDED.species_name,
        pond_area_ha = EXCLUDED.pond_area_ha,
        unit = EXCLUDED.unit,
        stocking_density = EXCLUDED.stocking_density,
        stocking_weight_g = EXCLUDED.stocking_weight_g,
        final_harvest_weight_g = EXCLUDED.final_harvest_weight_g,
        culture_duration_days = EXCLUDED.culture_duration_days,
        survival_fraction = EXCLUDED.survival_fraction,
        actual_fcr = EXCLUDED.actual_fcr,
        improved_fcr = EXCLUDED.improved_fcr,
        paddlewheel_units = EXCLUDED.paddlewheel_units,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const values = [
      landId,
      pondNumber,
      pondName,
      cultureType,
      speciesName,
      pondAreaHa,
      unit,
      stockingDensity,
      stockingWeightG,
      finalHarvestWeightG,
      cultureDurationDays,
      survivalFraction,
      actualFcr,
      improvedFcr,
      paddlewheelUnits
    ];

    const res = client ? await client.query(upsertSql, values) : await query(upsertSql, values);
    const savedPond = res.rows[0];

    // Calculate & persist pond carbon calculation
    const calcResult = calculateAquacultureCarbon({
      species_name: speciesName,
      culture_type: cultureType,
      pond_area_ha: pondAreaHa,
      stocking_density: stockingDensity,
      stocking_weight_g: stockingWeightG,
      final_harvest_weight_g: finalHarvestWeightG,
      culture_duration_days: cultureDurationDays,
      survival_fraction: survivalFraction,
      actual_fcr_used: actualFcr,
      improved_fcr: improvedFcr,
      paddlewheel_units: paddlewheelUnits
    });

    const calcSql = `
      INSERT INTO cpay.pond_carbon_calculations (
        calculation_id,
        pond_id,
        land_id,
        total_feed_required_kg,
        total_production_kg,
        co2e_reduction_per_crop_t,
        pct_reduction,
        carbon_credit_per_year_t,
        carbon_credit_per_ha_per_year_t,
        portfolio_value,
        calculation_details,
        calculated_at
      ) VALUES (
        uuid_generate_v4(),
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP
      )
    `;

    const calcValues = [
      savedPond.pond_id,
      landId,
      calcResult.total_feed_required_kg || 0,
      calcResult.total_production_kg || 0,
      calcResult.co2e_reduction_per_crop_t || 0,
      calcResult.pct_reduction || 0,
      calcResult.carbon_credit_per_year_t || 0,
      calcResult.carbon_credit_per_ha_per_year_t || 0,
      calcResult.portfolio_value || (calcResult.carbon_credit_per_year_t * 120),
      JSON.stringify(calcResult)
    ];

    if (client) {
      await client.query(calcSql, calcValues);
    } else {
      await query(calcSql, calcValues);
    }

    savedPonds.push({
      ...savedPond,
      calculation: calcResult
    });
  }

  return savedPonds;
}

export async function getPondsByLandId(landId) {
  const sql = `
    SELECT 
      p.*,
      c.total_feed_required_kg,
      c.total_production_kg,
      c.co2e_reduction_per_crop_t,
      c.pct_reduction,
      c.carbon_credit_per_year_t,
      c.carbon_credit_per_ha_per_year_t,
      c.portfolio_value,
      c.calculation_details
    FROM cpay.ponds p
    LEFT JOIN cpay.pond_carbon_calculations c ON p.pond_id = c.pond_id
    WHERE p.land_id = $1
    ORDER BY p.pond_number ASC
  `;
  const res = await query(sql, [landId]);
  return res.rows;
}

export function validatePondData(pondData) {
  const errors = [];

  if (!pondData.selectedSpecies && !pondData.speciesName && !pondData.species) {
    errors.push('Species selection is required');
  }

  const area = Number(pondData.pondAreaHa || pondData.area || pondData.pondArea || 0);
  if (isNaN(area) || area <= 0) {
    errors.push('Pond area must be greater than 0');
  }

  const stock = Number(pondData.stockingDensity || pondData.stockQuantity || pondData.quantity || 0);
  if (isNaN(stock) || stock <= 0) {
    errors.push('Stock quantity must be greater than 0');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
