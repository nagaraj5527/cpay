import { calculateAquacultureCarbon } from '../services/aquaculture_calculator.service.js';
import { getDefaultInputsFromExcel } from '../utils/carbonCalculator.js';
import pool from '../config/postgres.js';

export const getCalculatorDefaults = async (req, res) => {
  try {
    const defaults = getDefaultInputsFromExcel();
    return res.status(200).json({
      success: true,
      data: defaults
    });
  } catch (error) {
    console.error('Error in getCalculatorDefaults:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve calculator defaults',
      error: error.message
    });
  }
};

export const handleCalculation = async (req, res) => {
  try {
    const inputs = req.body;
    
    // Parse numeric fields in request body
    const parsedInputs = {};
    for (const key in inputs) {
      if (inputs[key] !== null && inputs[key] !== undefined && inputs[key] !== '') {
        if (!isNaN(inputs[key])) {
          parsedInputs[key] = Number(inputs[key]);
        } else {
          parsedInputs[key] = inputs[key];
        }
      }
    }

    // Call 10-Module specification calculation engine
    const rawResults = calculateAquacultureCarbon(parsedInputs);

    // Save calculation to PostgreSQL if registration_id or user is present
    const registrationId = parsedInputs.registrationId || parsedInputs.registration_id || null;
    if (registrationId) {
      try {
        await pool.query(
          `INSERT INTO cpay.aquaculture_ghg_calculations (
            registration_id, culture_type, pond_area_ha, crops_per_year,
            stocking_density, stocking_weight_g, final_harvest_weight_g,
            culture_duration_days, survival_fraction, actual_fcr_used,
            improved_fcr, total_feed_required_kg, improved_feed_kg,
            total_production_kg, feed_scope3_co2e_t, improved_feed_co2e_t,
            ch4_co2e_t, improved_ch4_co2e_t, n2o_co2e_t, improved_n2o_co2e_t,
            electricity_co2e_t, diesel_co2e_t, total_energy_co2e_t,
            improved_energy_co2e_t, gross_emission_baseline_t,
            gross_emission_improved_t, carbon_stored_biomass_t,
            net_emission_baseline_t, net_emission_improved_t,
            co2e_reduction_per_crop_t, pct_reduction,
            carbon_credit_per_year_t, carbon_credit_per_ha_per_year_t,
            gross_income, total_cost, net_profit, annual_net_profit,
            calculation_details
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38)`,
          [
            registrationId, rawResults.culture_type, rawResults.pond_area_ha, rawResults.crops_per_year,
            rawResults.stocking_density, rawResults.stocking_weight_g, rawResults.final_harvest_weight_g,
            rawResults.culture_duration_days, rawResults.survival_fraction, rawResults.actual_fcr_used,
            rawResults.improved_fcr, rawResults.total_feed_required_kg, rawResults.improved_feed_kg,
            rawResults.total_production_kg, rawResults.feed_scope3_co2e_t, rawResults.improved_feed_co2e_t,
            rawResults.ch4_co2e_t, rawResults.improved_ch4_co2e_t, rawResults.n2o_co2e_t, rawResults.improved_n2o_co2e_t,
            rawResults.electricity_co2e_t, rawResults.diesel_co2e_t, rawResults.total_energy_co2e_t,
            rawResults.improved_energy_co2e_t, rawResults.gross_emission_baseline_t,
            rawResults.gross_emission_improved_t, rawResults.carbon_stored_biomass_t,
            rawResults.net_emission_baseline_t, rawResults.net_emission_improved_t,
            rawResults.co2e_reduction_per_crop_t, rawResults.pct_reduction,
            rawResults.carbon_credit_per_year_t, rawResults.carbon_credit_per_ha_per_year_t,
            rawResults.gross_income, rawResults.total_cost, rawResults.net_profit, rawResults.annual_net_profit,
            JSON.stringify(rawResults)
          ]
        );
      } catch (err) {
        console.error('Error persisting aquaculture GHG calculation to database:', err);
      }
    }

    // Format output matching Excel sheet standards and frontend payload contract
    const formattedResults = {
      inputs: parsedInputs,
      farmSummary: {
        cultureType: rawResults.culture_type || 'IMC',
        pondAreaHa: rawResults.pond_area_ha,
        cropsPerYear: rawResults.crops_per_year,
        totalBiomassHarvestedKg: rawResults.total_production_kg,
        totalFeedRequiredKg: rawResults.total_feed_required_kg,
        actualFcrUsed: rawResults.actual_fcr_used
      },
      baseline: {
        feedRequiredKg: rawResults.total_feed_required_kg,
        feedScope3CO2e: rawResults.feed_scope3_co2e_t,
        electricityCO2e: rawResults.electricity_co2e_t,
        dieselCO2e: rawResults.diesel_co2e_t,
        ch4CO2e: rawResults.ch4_co2e_t,
        n2oCO2e: rawResults.n2o_co2e_t,
        energyCO2e: rawResults.total_energy_co2e_t,
        grossEmission: rawResults.gross_emission_baseline_t,
        totalFootprint: rawResults.gross_emission_baseline_t,
        biomassCarbonStoredCO2e: rawResults.carbon_stored_biomass_t,
        netEmission: rawResults.net_emission_baseline_t,
        emissionIntensity: rawResults.emission_intensity_baseline
      },
      improved: {
        feedRequiredKg: rawResults.improved_feed_kg,
        feedScope3CO2e: rawResults.improved_feed_co2e_t,
        electricityCO2e: rawResults.electricity_co2e_t,
        dieselCO2e: rawResults.diesel_co2e_t,
        ch4CO2e: rawResults.improved_ch4_co2e_t,
        n2oCO2e: rawResults.improved_n2o_co2e_t,
        energyCO2e: rawResults.improved_energy_co2e_t,
        grossEmission: rawResults.gross_emission_improved_t,
        totalFootprint: rawResults.gross_emission_improved_t,
        biomassCarbonStoredCO2e: rawResults.carbon_stored_biomass_t,
        netEmission: rawResults.net_emission_improved_t,
        emissionIntensity: rawResults.emission_intensity_baseline
      },
      summary: {
        creditsPerCrop: rawResults.co2e_reduction_per_crop_t,
        percentReduction: rawResults.pct_reduction,
        creditsPerYear: rawResults.carbon_credit_per_year_t,
        creditsPerHaPerYear: rawResults.carbon_credit_per_ha_per_year_t,
        biomassCarbonStoredCO2e: rawResults.carbon_stored_biomass_t,
        netEmissionBaseline: rawResults.net_emission_baseline_t,
        netEmissionImproved: rawResults.net_emission_improved_t,
        emissionIntensityBaseline: rawResults.emission_intensity_baseline
      },
      economics: {
        feedCostBaseline: rawResults.feed_cost,
        seedCost: rawResults.seed_cost,
        electricityCost: rawResults.electricity_cost,
        dieselCost: rawResults.diesel_cost,
        totalCostBaseline: rawResults.total_cost,
        grossIncome: rawResults.gross_income,
        netProfitBaseline: rawResults.net_profit,
        costPerKgBaseline: rawResults.cost_per_kg,
        annualNetProfit: rawResults.annual_net_profit
      }
    };

    return res.status(200).json({
      success: true,
      data: formattedResults
    });
  } catch (error) {
    console.error('Error in handleCalculation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate carbon credits',
      error: error.message
    });
  }
};
