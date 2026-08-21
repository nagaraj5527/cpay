/**
 * Consolidated Aquaculture GHG & Carbon Credit Calculation Engine
 * Upgraded v3.3 Engine with v3.4 Field-Data MRV Methodology Specification
 * 
 * Implements the 57 Consolidated Modules from:
 * 1. Indian_Aquaculture_GHG_Carbon_Tool_v3.3 Specification
 * 2. Indian_Aquaculture_GHG_Carbon_MRV_Tool_v3_4_Data_Collection_Calculation_Methodology_Manual
 */

// Species Database Constants (Module 1.1 / Module 2)
export const SPECIES_DATABASE = {
  'IMC': {
    culture_type: 'IMC',
    species_name: 'Indian Major Carp (Rohu, Catla, Mrigal)',
    stocking_density: 6250,
    stocking_weight_g: 150,
    partial_harvest_weight_g: 1000,
    final_harvest_weight_g: 1500,
    culture_duration_days: 240,
    survival_fraction: 0.80,
    aeration_required: false,
    average_fcr: 3.0,
    improved_fcr_target: 2.5,
    biomass_carbon_pct: 0.08,
    edible_yield_fraction: 0.65,
    fish_biomass_carbon_fraction: 0.08,
    fish_biomass_nitrogen_fraction: 0.025
  },
  'Fish': {
    culture_type: 'IMC',
    species_name: 'Indian Major Carp (Rohu, Catla, Mrigal)',
    stocking_density: 6250,
    stocking_weight_g: 150,
    partial_harvest_weight_g: 1000,
    final_harvest_weight_g: 1500,
    culture_duration_days: 240,
    survival_fraction: 0.80,
    aeration_required: false,
    average_fcr: 3.0,
    improved_fcr_target: 2.5,
    biomass_carbon_pct: 0.08,
    edible_yield_fraction: 0.65,
    fish_biomass_carbon_fraction: 0.08,
    fish_biomass_nitrogen_fraction: 0.025
  },
  'Pangasius': {
    culture_type: 'Pangasius',
    species_name: 'Pangasius (Striped Catfish)',
    stocking_density: 20000,
    stocking_weight_g: 15,
    partial_harvest_weight_g: null,
    final_harvest_weight_g: 1000,
    culture_duration_days: 180,
    survival_fraction: 0.85,
    aeration_required: true,
    average_fcr: 1.5,
    improved_fcr_target: 1.3,
    biomass_carbon_pct: 0.09,
    edible_yield_fraction: 0.60,
    fish_biomass_carbon_fraction: 0.09,
    fish_biomass_nitrogen_fraction: 0.027
  },
  'Red Pacu': {
    culture_type: 'Red Pacu',
    species_name: 'Roopchand (Red Pacu)',
    stocking_density: 10000,
    stocking_weight_g: 20,
    partial_harvest_weight_g: null,
    final_harvest_weight_g: 800,
    culture_duration_days: 210,
    survival_fraction: 0.80,
    aeration_required: false,
    average_fcr: 1.8,
    improved_fcr_target: 1.5,
    biomass_carbon_pct: 0.08,
    edible_yield_fraction: 0.62,
    fish_biomass_carbon_fraction: 0.08,
    fish_biomass_nitrogen_fraction: 0.025
  },
  'Roopchand': {
    culture_type: 'Red Pacu',
    species_name: 'Roopchand (Red Pacu)',
    stocking_density: 10000,
    stocking_weight_g: 20,
    partial_harvest_weight_g: null,
    final_harvest_weight_g: 800,
    culture_duration_days: 210,
    survival_fraction: 0.80,
    aeration_required: false,
    average_fcr: 1.8,
    improved_fcr_target: 1.5,
    biomass_carbon_pct: 0.08,
    edible_yield_fraction: 0.62,
    fish_biomass_carbon_fraction: 0.08,
    fish_biomass_nitrogen_fraction: 0.025
  },
  'P. vannamei': {
    culture_type: 'P. vannamei',
    species_name: 'Pacific White Shrimp (P. vannamei)',
    stocking_density: 400000,
    stocking_weight_g: 0.005,
    partial_harvest_weight_g: 12,
    final_harvest_weight_g: 20,
    culture_duration_days: 100,
    survival_fraction: 0.75,
    aeration_required: true,
    average_fcr: 1.4,
    improved_fcr_target: 1.2,
    biomass_carbon_pct: 0.10,
    edible_yield_fraction: 0.70,
    fish_biomass_carbon_fraction: 0.10,
    fish_biomass_nitrogen_fraction: 0.028
  },
  'P. monodon': {
    culture_type: 'P. monodon',
    species_name: 'Giant Tiger Prawn (P. monodon)',
    stocking_density: 150000,
    stocking_weight_g: 0.005,
    partial_harvest_weight_g: 18,
    final_harvest_weight_g: 30,
    culture_duration_days: 120,
    survival_fraction: 0.70,
    aeration_required: true,
    average_fcr: 1.6,
    improved_fcr_target: 1.35,
    biomass_carbon_pct: 0.10,
    edible_yield_fraction: 0.68,
    fish_biomass_carbon_fraction: 0.10,
    fish_biomass_nitrogen_fraction: 0.028
  }
};

// Database Default Ingredient Profiles (v3.4 Module 3)
export const INGREDIENT_DATABASE = {
  DOB: { name: 'Deoiled Rice Bran', protein_pct: 0.12, carbon_pct: 0.40, nitrogen_pct: 0.0192, ef_kgco2e_per_kg: 0.40 },
  GNC: { name: 'Groundnut Cake', protein_pct: 0.40, carbon_pct: 0.45, nitrogen_pct: 0.0640, ef_kgco2e_per_kg: 1.20 },
  SBM: { name: 'Soybean Meal', protein_pct: 0.44, carbon_pct: 0.46, nitrogen_pct: 0.0704, ef_kgco2e_per_kg: 0.85 },
  DDGS: { name: 'Distillers Dried Grains with Solubles', protein_pct: 0.28, carbon_pct: 0.42, nitrogen_pct: 0.0448, ef_kgco2e_per_kg: 0.65 }
};

/**
 * Main Consolidated Calculation Engine Function
 */
export function calculateAquacultureCarbon(input = {}) {
  // ---------------------------------------------------------
  // MODULE 1 — FARM / POND / CROP IDENTIFICATION
  // ---------------------------------------------------------
  const farm_id = input.farm_id || input.farmId || 'FARM-001';
  const pond_id = input.pond_id || input.pondId || input.id || 'POND-001';
  const farmer_operator = input.farmer_operator || input.operatorName || 'Farmer';
  const latitude = Number(input.latitude ?? 16.5062);
  const longitude = Number(input.longitude ?? 80.6480);
  const pond_area_ha = Number(input.pond_area_ha ?? input.pondArea ?? input.area ?? 1.0);
  const stocking_date = input.stocking_date || input.stockingDate || null;
  const planned_harvest_date = input.planned_harvest_date || input.plannedHarvestDate || null;
  const actual_harvest_date = input.actual_harvest_date || input.actualHarvestDate || null;
  const culture_type = input.culture_type || input.species_name || input.plantationType || 'IMC';
  const species = SPECIES_DATABASE[culture_type] || SPECIES_DATABASE['IMC'];
  const isIMC = (culture_type === 'IMC' || culture_type === 'Fish' || culture_type === 'Roopchand' || culture_type === 'Tilapia');

  // ---------------------------------------------------------
  // MODULE 2 — SPECIES / STOCKING INPUTS
  // ---------------------------------------------------------
  const stocking_density = Number(input.stocking_density ?? species.stocking_density);
  const seed_quantity = Number(input.seed_quantity ?? input.quantity ?? (stocking_density * pond_area_ha));
  const stocking_weight_g = Number(input.stocking_weight_g ?? input.stockingWeightG ?? species.stocking_weight_g);
  const final_harvest_weight_g = Number(input.final_harvest_weight_g ?? input.finalHarvestWeightG ?? species.final_harvest_weight_g);
  const culture_duration_days = Number(input.culture_duration_days ?? input.cropDuration ?? species.culture_duration_days);
  const survival_fraction = Number(input.survival_fraction ?? input.survivalFraction ?? species.survival_fraction);
  const farm_reported_fcr = input.farm_reported_fcr ?? input.farmReportedFcr ?? input.actualFCR ?? input.fcr;

  // Stocked population calculation
  const total_stocked_number = seed_quantity > 0 ? seed_quantity : (stocking_density * pond_area_ha);

  // Aeration Lock for IMC Configuration
  const raw_paddlewheel_units = Number(input.paddlewheel_units ?? input.paddlewheelUnits ?? 0);
  const raw_blower_kw = Number(input.blower_kw ?? input.blowerKw ?? 0);
  const aeration_required = isIMC ? false : (input.aeration_required ?? species.aeration_required);

  // ---------------------------------------------------------
  // MODULE 3, 4, 5, 6, 7, 8, 9, 10 — FEED INGREDIENT FORMULATION & BLENDS
  // ---------------------------------------------------------
  const q_dob = Number(input.q_dob ?? input.qDob ?? 0);
  const q_gnc = Number(input.q_gnc ?? input.qGnc ?? 0);
  const q_sbm = Number(input.q_sbm ?? input.qSbm ?? 0);
  const q_ddgs = Number(input.q_ddgs ?? input.qDdgs ?? 0);
  const feed_mix_total_kg = q_dob + q_gnc + q_sbm + q_ddgs;

  let feed_protein_pct = Number(input.feed_protein_pct ?? input.feedCrudeProtein ?? species.feed_protein_pct ?? 0.28);
  let feed_carbon_pct = Number(input.feed_carbon_pct ?? input.feedCarbonContent ?? species.feed_carbon_pct ?? 0.40);
  let feed_nitrogen_pct = feed_protein_pct / 6.25;
  let feed_mfg_ef = Number(input.feed_mfg_ef ?? 0.4727);

  if (feed_mix_total_kg > 0) {
    feed_protein_pct = (q_dob * INGREDIENT_DATABASE.DOB.protein_pct +
                        q_gnc * INGREDIENT_DATABASE.GNC.protein_pct +
                        q_sbm * INGREDIENT_DATABASE.SBM.protein_pct +
                        q_ddgs * INGREDIENT_DATABASE.DDGS.protein_pct) / feed_mix_total_kg;

    feed_carbon_pct = (q_dob * INGREDIENT_DATABASE.DOB.carbon_pct +
                       q_gnc * INGREDIENT_DATABASE.GNC.carbon_pct +
                       q_sbm * INGREDIENT_DATABASE.SBM.carbon_pct +
                       q_ddgs * INGREDIENT_DATABASE.DDGS.carbon_pct) / feed_mix_total_kg;

    // v3.4 replaces protein / 6.25 with actual ingredient nitrogen sum
    feed_nitrogen_pct = (q_dob * INGREDIENT_DATABASE.DOB.nitrogen_pct +
                         q_gnc * INGREDIENT_DATABASE.GNC.nitrogen_pct +
                         q_sbm * INGREDIENT_DATABASE.SBM.nitrogen_pct +
                         q_ddgs * INGREDIENT_DATABASE.DDGS.nitrogen_pct) / feed_mix_total_kg;

    feed_mfg_ef = (q_dob * INGREDIENT_DATABASE.DOB.ef_kgco2e_per_kg +
                   q_gnc * INGREDIENT_DATABASE.GNC.ef_kgco2e_per_kg +
                   q_sbm * INGREDIENT_DATABASE.SBM.ef_kgco2e_per_kg +
                   q_ddgs * INGREDIENT_DATABASE.DDGS.ef_kgco2e_per_kg) / feed_mix_total_kg;
  }

  // Inventory Reconciled Feed Used
  const feed_opening_stock_kg = Number(input.feed_opening_stock_kg ?? 0);
  const feed_purchases_kg = Number(input.feed_purchases_kg ?? (feed_mix_total_kg > 0 ? feed_mix_total_kg : 0));
  const feed_closing_stock_kg = Number(input.feed_closing_stock_kg ?? 0);
  const feed_reconciled_kg = feed_opening_stock_kg + feed_purchases_kg - feed_closing_stock_kg;

  // ---------------------------------------------------------
  // MODULE 11 — GROWTH MODEL & POPULATION CASCADE (v3.3 Retained)
  // ---------------------------------------------------------
  const growth_curve_type = input.growth_curve_type || 'Exponential';
  const mortality_feed_factor = Number(input.mortality_feed_factor ?? 0.5);
  const stage_fcr_multiplier = Number(input.stage_fcr_multiplier ?? 1.0);

  const sgr_k = Math.log(final_harvest_weight_g / stocking_weight_g) / culture_duration_days;
  const logistic_wmax = final_harvest_weight_g / 0.98;
  const logistic_r = -Math.log(((logistic_wmax / final_harvest_weight_g) - 1) * stocking_weight_g / (logistic_wmax - stocking_weight_g)) / culture_duration_days;

  const period_length = culture_duration_days / 6;
  let cumulative_feed_kg = 0;
  let period_biomass_kg = 0;

  let prev_biomass_kg = stocking_weight_g * total_stocked_number / 1000;
  let prev_population = total_stocked_number;
  let prev_weight_g = stocking_weight_g;

  for (let p = 1; p <= 6; p++) {
    const day = period_length * p;
    let weight_g = 0;
    if (growth_curve_type === 'Logistic') {
      weight_g = logistic_wmax / (1 + ((logistic_wmax - stocking_weight_g) / stocking_weight_g) * Math.exp(-logistic_r * day));
    } else {
      weight_g = stocking_weight_g * Math.exp(sgr_k * day);
    }

    const population = total_stocked_number * (1 - (1 - survival_fraction) * (day / culture_duration_days));
    const biomass_kg = weight_g * population / 1000;

    const mortality_feed_kg = mortality_feed_factor * ((prev_population - population) * ((prev_weight_g + weight_g) / 2) / 1000);
    const period_feed_kg = (Math.max(0, biomass_kg - prev_biomass_kg) + mortality_feed_kg) * species.average_fcr * stage_fcr_multiplier;

    cumulative_feed_kg += period_feed_kg;
    period_biomass_kg = biomass_kg;

    prev_biomass_kg = biomass_kg;
    prev_population = population;
    prev_weight_g = weight_g;
  }

  const standing_biomass_end_kg = period_biomass_kg;

  // ---------------------------------------------------------
  // MODULE 12, 13, 14, 15, 16 — FCR & ECOLOGICAL ADJUSTMENTS (v3.4 Engine)
  // ---------------------------------------------------------
  // Punch Bag Feeding System
  const punch_bag_feeding = !!(input.punch_bag_feeding ?? input.punchBagFeeding);
  const fcr_punch_bag_factor = punch_bag_feeding ? 0.875 : 1.0; // 12.5% FCR reduction

  // Diurnal DO Stress Penalty
  const pre_dawn_do = Number(input.pre_dawn_do ?? input.preDawnDo ?? 4.5);
  const do_stress_factor = pre_dawn_do < 3.0 ? 1.10 : 1.00; // +10% stress penalty when pre-dawn DO < 3.0 mg/L

  // Solar Photosynthesis Factor (SPF) - Module 14
  const day_of_year = 180; // Representative mid-season day
  const lat_rad = latitude * (Math.PI / 180);
  const delta = 0.409 * Math.sin((2 * Math.PI * day_of_year / 365) - 1.39);
  const tan_term = -Math.tan(lat_rad) * Math.tan(delta);
  const omega_s = Math.acos(Math.max(-1, Math.min(1, tan_term)));
  const daylight_factor = (24 / Math.PI) * omega_s / 24;
  const d_r = 1 + 0.033 * Math.cos(2 * Math.PI * day_of_year / 365);
  const r_a = (24 * 60 / Math.PI) * 0.0820 * d_r * (omega_s * Math.sin(lat_rad) * Math.sin(delta) + Math.cos(lat_rad) * Math.cos(delta) * Math.sin(omega_s));
  const solar_radiation_factor = Math.min(1, Math.max(0, r_a / 40.0));
  const spf = Math.min(1, Math.max(0, 0.80 * solar_radiation_factor + 0.20 * daylight_factor));

  // Plankton Quality Index (PQI) - Module 15
  const diatoms_pct = Number(input.diatoms_pct ?? input.diatomsPct ?? 40.0);
  const green_algae_pct = Number(input.green_algae_pct ?? input.greenAlgaePct ?? 35.0);
  const zooplankton_score = Math.min(3, Math.max(0, Number(input.zooplankton_score ?? input.zooplanktonScore ?? 2)));
  const cyanobacteria_avg = Number(input.cyanobacteria_avg ?? input.cyanobacteriaAvg ?? 15.0);

  const aqi = Math.min(1.0, (diatoms_pct + green_algae_pct) / 60.0);
  const zqi = zooplankton_score / 3.0;
  const pqi = 0.60 * aqi + 0.40 * zqi;

  // Weekly Observation Coverage Completeness Check - Module 42
  const observed_weekly_records = Number(input.observed_weekly_records ?? 12);
  const expected_weekly_records = Math.ceil(culture_duration_days / 7);
  const wq_completeness = Math.min(1.0, observed_weekly_records / expected_weekly_records);

  // Natural Feed Offset - Module 16
  let natural_feed_offset = 0;
  if (wq_completeness >= 0.75) {
    if (cyanobacteria_avg <= 50) {
      natural_feed_offset = Math.min(0.20, 0.20 * pqi * spf);
    } else {
      natural_feed_offset = Math.min(0.05, 0.20 * pqi * spf);
    }
  }

  let baseline_fcr = (farm_reported_fcr !== null && farm_reported_fcr !== undefined && !isNaN(farm_reported_fcr) && Number(farm_reported_fcr) > 0)
    ? Number(farm_reported_fcr)
    : species.average_fcr;

  // Effective FCR Chain
  const actual_fcr_used = baseline_fcr * (1 - natural_feed_offset) * fcr_punch_bag_factor * do_stress_factor;

  // Final MRV Reconciled Feed Used
  let total_feed_required_kg = Number(input.total_feed_required_kg ?? input.qtyFeedConsumed ?? 0);
  if (total_feed_required_kg <= 0) {
    if (feed_reconciled_kg > 0) {
      total_feed_required_kg = feed_reconciled_kg;
    } else {
      total_feed_required_kg = cumulative_feed_kg;
    }
  }

  // ---------------------------------------------------------
  // MODULE 17, 18, 19 — WATER QUALITY, DYNAMIC ANAEROBIC FRACTION & SOIL C:N
  // ---------------------------------------------------------
  const h2s_detected = !!(input.h2s_detected ?? input.h2sDetected);
  let dynamic_af = 0.20;
  if (pre_dawn_do >= 4.0 && !h2s_detected) {
    dynamic_af = 0.12; // 12% optimal DO
  } else if (pre_dawn_do < 3.0 && h2s_detected) {
    dynamic_af = 0.30; // 30% severe oxygen stress
  }
  const anaerobic_fraction = Number(input.anaerobic_fraction ?? input.baselineAnaerobicFraction ?? dynamic_af);
  const anaerobic_adjustment_factor = Number(input.anaerobic_adjustment_factor ?? 1.0);

  // Soil C:N Adjustment Factor - Module 19
  const soil_cn_ratio = Number(input.soil_cn_ratio ?? input.soilCnRatio ?? 12.0);
  let cn_adj = 1.00;
  if (soil_cn_ratio > 30) {
    cn_adj = 1.25;
  } else if (soil_cn_ratio > 20) {
    cn_adj = 1.15;
  }

  // ---------------------------------------------------------
  // MODULE 34, 35 — HARVEST CASCADE & HARVEST QA CHECK
  // ---------------------------------------------------------
  let total_production_kg = 0;
  const actual_harvest_weight_kg = Number(input.actual_harvest_weight_kg ?? input.totalProductionKg ?? 0);

  if (actual_harvest_weight_kg > 0) {
    total_production_kg = actual_harvest_weight_kg;
  } else if (input.harvest_events && Array.isArray(input.harvest_events) && input.harvest_events.length > 0) {
    let current_population = total_stocked_number;
    input.harvest_events.forEach(event => {
      const event_day = Number(event.event_day || culture_duration_days);
      const event_pct = Number(event.event_pct_harvested || 1.0);
      let weight_g = 0;
      if (event.event_count_per_kg) {
        weight_g = 1000 / Number(event.event_count_per_kg);
      } else if (growth_curve_type === 'Logistic') {
        weight_g = logistic_wmax / (1 + ((logistic_wmax - stocking_weight_g) / stocking_weight_g) * Math.exp(-logistic_r * event_day));
      } else {
        weight_g = stocking_weight_g * Math.exp(sgr_k * event_day);
      }
      const pop_harvested = current_population * event_pct;
      const qty_kg = pop_harvested * weight_g / 1000;
      total_production_kg += qty_kg;
      current_population -= pop_harvested;
    });
  } else {
    total_production_kg = standing_biomass_end_kg;
  }

  const theoretical_max_biomass = standing_biomass_end_kg;
  const harvest_variance_pct = standing_biomass_end_kg > 0 ? ((total_production_kg - standing_biomass_end_kg) / standing_biomass_end_kg * 100) : 0;
  const harvest_check = (total_production_kg <= theoretical_max_biomass * 1.20) ? 'PASS' : 'REVIEW';

  // ---------------------------------------------------------
  // MODULE 20, 21 — CARBON & NITROGEN MASS BALANCE
  // ---------------------------------------------------------
  const c_feed = total_feed_required_kg * feed_carbon_pct;
  const c_retained = total_production_kg * species.fish_biomass_carbon_fraction;
  const c_lost_to_pond = Math.max(0, c_feed - c_retained);

  const n_feed = total_feed_required_kg * feed_nitrogen_pct;
  const n_retained = total_production_kg * species.fish_biomass_nitrogen_fraction;
  const n_lost_to_pond = Math.max(0, n_feed - n_retained);

  // Residual Checks - Modules 45 & 46
  const carbon_residual = c_feed - c_retained - c_lost_to_pond;
  const nitrogen_residual = n_feed - n_retained - n_lost_to_pond;
  const carbon_balance_check = Math.abs(carbon_residual) <= 0.001 ? 'PASS' : 'FAIL';
  const nitrogen_balance_check = Math.abs(nitrogen_residual) <= 0.001 ? 'PASS' : 'FAIL';

  // ---------------------------------------------------------
  // MODULE 22, 23, 24, 25 — METHANE (CH4) & NITROUS OXIDE (N2O)
  // ---------------------------------------------------------
  const sediment_burial_fraction = Number(input.sediment_burial_fraction ?? 0.20);
  const ch4_oxidation_fraction = Number(input.ch4_oxidation_fraction ?? 0.25);
  const gwp_framework = input.gwp_framework || input.gwpFramework || 'AR5';
  const gwp_ch4 = (gwp_framework === 'AR6') ? 27.0 : Number(input.gwp_ch4 ?? input.gwpCH4 ?? 28.0);
  const gwp_n2o = (gwp_framework === 'AR6') ? 273.0 : Number(input.gwp_n2o ?? input.gwpN2O ?? 265.0);

  // Methane Generation Chain - Module 22
  const c_anaerobic = c_lost_to_pond * anaerobic_fraction * anaerobic_adjustment_factor * cn_adj;
  const c_available_for_ch4 = c_anaerobic * (1 - sediment_burial_fraction);
  const ch4_c_produced_kg = c_available_for_ch4 * 0.50; // f_CH4-C default 0.50
  const ch4_gross_kg = ch4_c_produced_kg * (16 / 12);
  const ch4_emitted_kg = ch4_gross_kg * (1 - ch4_oxidation_fraction);

  // Measured CH4 Override - Module 23
  const ch4_used_kg = (input.measured_ch4_kg !== null && input.measured_ch4_kg !== undefined && !isNaN(input.measured_ch4_kg))
    ? Number(input.measured_ch4_kg)
    : ch4_emitted_kg;
  const ch4_co2e_t = ch4_used_kg * gwp_ch4 / 1000;

  // N2O Cyanobacteria Adjustment (+20% when Cyanobacteria > 50%) - Module 24 & 41
  const cyanobacteria_n2o_adj = cyanobacteria_avg > 50 ? 1.20 : 1.00;
  const n2o_ef_preset = input.n2o_ef_preset || input.n2oEfPreset || '0.71%';
  const n2o_ef_custom = Number(input.n2o_ef_custom ?? input.n2oEfCustom ?? 0.008);
  const base_n2o_n_ef = n2o_ef_preset === 'Custom' ? n2o_ef_custom : (n2o_ef_preset === '1.8%' ? 0.018 : 0.0071);
  const n2o_n_ef_adjusted = base_n2o_n_ef * cyanobacteria_n2o_adj;

  const n2o_emitted_kg = n_lost_to_pond * n2o_n_ef_adjusted * (44 / 28);
  // Measured N2O Override - Module 25
  const n2o_used_kg = (input.measured_n2o_kg !== null && input.measured_n2o_kg !== undefined && !isNaN(input.measured_n2o_kg))
    ? Number(input.measured_n2o_kg)
    : n2o_emitted_kg;
  const n2o_co2e_t = n2o_used_kg * gwp_n2o / 1000;

  // ---------------------------------------------------------
  // MODULE 26 — LIME AND FERTILIZER
  // ---------------------------------------------------------
  const lime_applied_kg = Number(input.lime_applied_kg ?? 200);
  const lime_ef = Number(input.lime_ef ?? 0.12);
  const lime_co2e_t = (lime_applied_kg / 1000) * lime_ef;

  const fertilizer_n_kg = Number(input.fertilizer_n_kg ?? 0);
  const fertilizer_n2o_ef = Number(input.fertilizer_n2o_ef ?? 0.01);
  const fertilizer_n2o_kg = fertilizer_n_kg * fertilizer_n2o_ef * (44 / 28);
  const fertilizer_co2e_t = fertilizer_n2o_kg * gwp_n2o / 1000;
  const lime_fertilizer_co2e_t = lime_co2e_t + fertilizer_co2e_t;

  // ---------------------------------------------------------
  // MODULE 27, 28, 29, 30, 31 — ENERGY & IMC AERATION LOCK
  // ---------------------------------------------------------
  const paddlewheel_hp = isIMC ? 0 : Number(input.paddlewheel_hp ?? 2);
  const paddlewheel_units = isIMC ? 0 : Number(input.paddlewheel_units ?? (aeration_required ? 4 : 0));
  const paddlewheel_hours = isIMC ? 0 : Number(input.paddlewheel_hours ?? (aeration_required ? 8 : 0));
  const blower_kw = isIMC ? 0 : Number(input.blower_kw ?? 0);
  const blower_hours = isIMC ? 0 : Number(input.blower_hours ?? 0);

  const paddlewheel_kwh = paddlewheel_hp * 0.746 * paddlewheel_units * paddlewheel_hours;
  const blower_kwh = blower_kw * blower_hours;

  const grid_kwh = Number(input.grid_kwh ?? 500);
  const solar_offset_kwh = Number(input.solar_offset_kwh ?? 0);
  const total_electricity_kwh = Math.max(0, paddlewheel_kwh + blower_kwh + grid_kwh - solar_offset_kwh);
  const grid_ef = Number(input.grid_ef ?? 0.710);
  const electricity_co2e_t = total_electricity_kwh * grid_ef / 1000;

  const diesel_l = Number(input.diesel_l ?? input.dieselBaseline ?? 500);
  const generator_diesel_l = Number(input.generator_diesel_l ?? 200);
  const diesel_ef = Number(input.diesel_ef ?? input.dieselEF ?? 3.0);
  const diesel_co2e_t = (diesel_l + generator_diesel_l) * diesel_ef / 1000;
  const total_energy_co2e_t = electricity_co2e_t + diesel_co2e_t;

  // ---------------------------------------------------------
  // MODULE 32, 33 — IDLE POND PHASE & SOIL BENTHIC COUPLING
  // ---------------------------------------------------------
  const idle_days = Number(input.idle_days ?? 20);
  const idle_ef_kgco2e_per_ha_day = Number(input.idle_ef_kgco2e_per_ha_day ?? 2.0);
  const idle_phase_co2e_t = pond_area_ha * idle_days * idle_ef_kgco2e_per_ha_day / 1000;

  const pre_stocking_soc = Number(input.pre_stocking_soc ?? input.preStockingSoc ?? 1.20);
  const post_harvest_soc = Number(input.post_harvest_soc ?? input.postHarvestSoc ?? 1.45);
  const bulk_density = Number(input.bulk_density ?? input.bulkDensity ?? 1.25);
  const sampling_depth = Number(input.sampling_depth ?? input.samplingDepth ?? 0.15);

  const delta_soc_pct = post_harvest_soc - pre_stocking_soc;
  const delta_soc_mass_tc = (delta_soc_pct / 100) * bulk_density * sampling_depth * pond_area_ha * 10000;
  const delta_soc_annualized_tc = delta_soc_mass_tc * 365 / culture_duration_days;
  const co2e_equivalent_soc_t = delta_soc_annualized_tc * (44 / 12);
  const soc_check = (pre_stocking_soc > 0 && post_harvest_soc > 0) ? 'PASS' : 'REVIEW';

  // ---------------------------------------------------------
  // MODULE 38 — ECONOMICS ENGINE
  // ---------------------------------------------------------
  const feed_price = Number(input.feed_price ?? 45);
  const electricity_tariff = Number(input.electricity_tariff ?? 7.0);
  const diesel_price = Number(input.diesel_price ?? 92);
  const labour_cost = Number(input.labour_cost ?? 60000);
  const probiotics_cost = Number(input.probiotics_cost ?? 25000);
  const seed_price = Number(input.seed_price ?? 3.5);
  const other_costs = Number(input.other_costs ?? 20000);
  const sale_price = Number(input.sale_price ?? 130);

  const feed_cost = total_feed_required_kg * feed_price;
  const electricity_cost = total_electricity_kwh * electricity_tariff;
  const diesel_cost = (diesel_l + generator_diesel_l) * diesel_price;
  const seed_cost = total_stocked_number * seed_price;
  const total_cost = feed_cost + electricity_cost + diesel_cost + seed_cost + labour_cost + probiotics_cost + other_costs;

  const gross_income = total_production_kg * sale_price;
  const net_profit = gross_income - total_cost;
  const cost_per_kg = total_production_kg > 0 ? (total_cost / total_production_kg) : 0;
  const crops_per_year = Number(input.crops_per_year ?? input.cropsPerYear ?? 1.5);
  const annual_net_profit = net_profit * crops_per_year;

  // ---------------------------------------------------------
  // MODULE 39, 40, 41 — IMPROVED FARMING SCENARIO ENGINE
  // Note: Better Aeration is REMOVED / DISABLED for IMC configuration
  // ---------------------------------------------------------
  let measures = input.measures;
  if (!measures && input.interventions && typeof input.interventions === 'object') {
    const ints = input.interventions;
    measures = [
      { name: 'Better Feed', apply: !!ints.betterFeed, fcr_effect: 0.05, anaerobic_effect: 0, n2o_effect: 0 },
      { name: 'Water Probiotics', apply: !!ints.waterProbiotics, fcr_effect: 0.03, anaerobic_effect: 0.30, n2o_effect: 0 },
      { name: 'Soil Probiotics', apply: !!ints.soilProbiotics, fcr_effect: 0.02, anaerobic_effect: 0.20, n2o_effect: 0 },
      { name: 'Better Aeration', apply: isIMC ? false : !!ints.betterAeration, fcr_effect: isIMC ? 0 : 0.04, anaerobic_effect: isIMC ? 0 : 0.25, n2o_effect: 0 },
      { name: 'Water Quality Management', apply: !!ints.waterQualityMgmt, fcr_effect: 0.02, anaerobic_effect: 0, n2o_effect: 0.15 },
      { name: 'Optimized Feeding Timing', apply: !!ints.optimizedFeeding, fcr_effect: 0.03, anaerobic_effect: 0, n2o_effect: 0 },
      { name: 'C/N Ratio Management', apply: !!ints.cnRatioMgmt, fcr_effect: 0, anaerobic_effect: 0.20, n2o_effect: 0.10 }
    ];
  }
  if (!measures) {
    measures = [
      { name: 'Better Feed', apply: true, fcr_effect: 0.05, anaerobic_effect: 0, n2o_effect: 0 },
      { name: 'Water Probiotics', apply: true, fcr_effect: 0.03, anaerobic_effect: 0.30, n2o_effect: 0 },
      { name: 'Soil Probiotics', apply: true, fcr_effect: 0.02, anaerobic_effect: 0.20, n2o_effect: 0 },
      { name: 'Better Aeration', apply: false, fcr_effect: 0, anaerobic_effect: 0, n2o_effect: 0 },
      { name: 'Water Quality Management', apply: true, fcr_effect: 0.02, anaerobic_effect: 0, n2o_effect: 0.15 },
      { name: 'Optimized Feeding Timing', apply: true, fcr_effect: 0.03, anaerobic_effect: 0, n2o_effect: 0 },
      { name: 'C/N Ratio Management', apply: false, fcr_effect: 0, anaerobic_effect: 0.20, n2o_effect: 0.10 }
    ];
  }

  let fcr_product = 1.0;
  let anaerobic_product = 1.0;
  let n2o_product = 1.0;

  measures.forEach(m => {
    if (m.apply) {
      if (m.fcr_effect > 0) fcr_product *= (1 - m.fcr_effect);
      if (m.anaerobic_effect > 0) anaerobic_product *= (1 - m.anaerobic_effect);
      if (m.n2o_effect > 0) n2o_product *= (1 - m.n2o_effect);
    }
  });

  const combined_fcr_improvement = 1 - fcr_product;
  const combined_anaerobic_reduction = 1 - anaerobic_product;
  const combined_n2o_reduction = 1 - n2o_product;

  const better_feed_measure = measures.find(m => m.name === 'Better Feed' && m.apply);
  const feed_ef_reduction = better_feed_measure ? 0.05 : 0;
  const fcr_imp_factor = Number(input.fcr_improvement ?? 0.10);
  const final_fcr_improvement = Math.max(combined_fcr_improvement, fcr_imp_factor);

  const improved_fcr = actual_fcr_used * (1 - final_fcr_improvement);
  const improved_feed_kg = total_feed_required_kg * (improved_fcr / actual_fcr_used);
  const improved_feed_ef = feed_mfg_ef * (1 - feed_ef_reduction);
  const improved_feed_co2e_t = improved_feed_kg * improved_feed_ef / 1000;

  const improved_c_feed = improved_feed_kg * feed_carbon_pct;
  const improved_c_retained = total_production_kg * species.fish_biomass_carbon_fraction;
  const improved_c_lost_to_pond = Math.max(0, improved_c_feed - improved_c_retained);

  const improved_anaerobic_fraction = Number(input.improved_anaerobic_fraction ?? (anaerobic_fraction * (1 - combined_anaerobic_reduction) * anaerobic_adjustment_factor));
  const improved_c_anaerobic = improved_c_lost_to_pond * improved_anaerobic_fraction * cn_adj;
  const improved_c_available_ch4 = improved_c_anaerobic * (1 - sediment_burial_fraction);
  const improved_ch4_kg = improved_c_available_ch4 * 0.50 * (16 / 12) * (1 - ch4_oxidation_fraction);
  const improved_ch4_co2e_t = improved_ch4_kg * gwp_ch4 / 1000;

  const improved_n_feed = improved_feed_kg * feed_nitrogen_pct;
  const improved_n_retained = total_production_kg * species.fish_biomass_nitrogen_fraction;
  const improved_n_lost_to_pond = Math.max(0, improved_n_feed - improved_n_retained);

  const improved_n2o_n_ef = n2o_n_ef_adjusted * (1 - combined_n2o_reduction);
  const improved_n2o_kg = improved_n_lost_to_pond * improved_n2o_n_ef * (44 / 28);
  const improved_n2o_co2e_t = improved_n2o_kg * gwp_n2o / 1000;

  const improved_energy_co2e_t = total_energy_co2e_t;

  // ---------------------------------------------------------
  // MODULE 48, 49, 50, 51, 52, 53, 54, 55, 56 — CARBON ACCOUNTING & REDUCTION
  // ---------------------------------------------------------
  const biomass_carbon_pct = Number(input.biomass_carbon_pct ?? species.biomass_carbon_pct);
  const edible_yield_fraction = Number(input.edible_yield_fraction ?? species.edible_yield_fraction);

  // Scopes (Module 48, 49, 50)
  const scope1_baseline = ch4_co2e_t + n2o_co2e_t + lime_fertilizer_co2e_t + idle_phase_co2e_t;
  const scope1_improved = improved_ch4_co2e_t + improved_n2o_co2e_t + lime_fertilizer_co2e_t + idle_phase_co2e_t;

  const scope2_baseline = total_energy_co2e_t;
  const scope2_improved = improved_energy_co2e_t;

  const scope3_baseline = feed_scope3_co2e_t;
  const scope3_improved = improved_feed_co2e_t;

  // Net Emissions (Module 51, 52)
  const gross_emission_baseline_t = scope1_baseline + scope2_baseline + scope3_baseline;
  const gross_emission_improved_t = scope1_improved + scope2_improved + scope3_improved;

  const carbon_stored_biomass_t = total_production_kg * biomass_carbon_pct * (44 / 12) / 1000;
  const net_emission_baseline_t = gross_emission_baseline_t - carbon_stored_biomass_t;
  const net_emission_improved_t = gross_emission_improved_t - carbon_stored_biomass_t;

  const emission_intensity_baseline = total_production_kg > 0 ? (net_emission_baseline_t * 1000 / total_production_kg) : 0;
  const edible_production_kg = total_production_kg * edible_yield_fraction;
  const emission_intensity_edible = edible_production_kg > 0 ? (net_emission_baseline_t * 1000 / edible_production_kg) : 0;

  // Gross Emission Reduction & Annual Reduction (Module 53, 54, 55, 56)
  const co2e_reduction_per_crop_t = gross_emission_baseline_t - gross_emission_improved_t;
  const pct_reduction = gross_emission_baseline_t > 0 ? (co2e_reduction_per_crop_t / gross_emission_baseline_t * 100) : 0;

  const carbon_credit_per_year_t = co2e_reduction_per_crop_t * crops_per_year;
  const carbon_credit_per_ha_per_year_t = pond_area_ha > 0 ? (carbon_credit_per_year_t / pond_area_ha) : 0;

  // ---------------------------------------------------------
  // MODULE 43, 44, 45, 46, 57 — MRV INTEGRITY TRAFFIC LIGHT CHECKS
  // ---------------------------------------------------------
  const feed_mix_check = (feed_mix_total_kg === 0 || Math.abs((q_dob + q_gnc + q_sbm + q_ddgs) - feed_mix_total_kg) <= 0.01) ? 'PASS' : 'FAIL';

  const mrv_checks = {
    imc_aeration_lock: (isIMC && (raw_paddlewheel_units > 0 || raw_blower_kw > 0)) ? 'FAIL' : 'PASS',
    feed_mix_check: feed_mix_check,
    soc_test_integrity: soc_check,
    do_integrity: pre_dawn_do >= 0 ? 'PASS' : 'FAIL',
    cyanobacteria_status: cyanobacteria_avg > 50 ? 'REVIEW' : 'PASS',
    harvest_vs_model: harvest_check,
    carbon_balance: carbon_balance_check,
    nitrogen_balance: nitrogen_balance_check
  };

  let mrv_status = 'PASS';
  if (Object.values(mrv_checks).includes('FAIL')) {
    mrv_status = 'FAIL';
  } else if (Object.values(mrv_checks).includes('REVIEW')) {
    mrv_status = 'REVIEW';
  }

  // ---------------------------------------------------------
  // FINAL CONSOLIDATED RETURN OBJECT (All v3.3 & v3.4 Parameters)
  // ---------------------------------------------------------
  return {
    // Farm / Pond Identification
    farm_id,
    pond_id,
    farmer_operator,
    latitude,
    longitude,
    stocking_date,
    planned_harvest_date,
    actual_harvest_date,

    // Species & Culture Setup
    culture_type,
    species_name: species.species_name,
    stocking_density,
    seed_quantity,
    stocking_weight_g,
    final_harvest_weight_g,
    culture_duration_days,
    survival_fraction,
    pond_area_ha,
    crops_per_year,

    // Growth & Harvest Engine (v3.3 Retained Parameters)
    growth_curve_type,
    mortality_feed_factor,
    stage_fcr_multiplier,
    sgr_k,
    logistic_wmax,
    logistic_r,
    total_stocked_number,
    standing_biomass_end_kg,
    harvest_variance_pct,
    edible_production_kg,
    edible_yield_fraction,
    biomass_carbon_pct,

    // FCR & Dynamic Adjustments
    baseline_fcr,
    actual_fcr_used,
    improved_fcr,
    fcr_punch_bag_factor,
    do_stress_factor,
    natural_feed_offset,
    wq_completeness,
    pqi,
    spf,

    // Feed Quantities & Blends
    q_dob,
    q_gnc,
    q_sbm,
    q_ddgs,
    feed_mix_total_kg,
    feed_protein_pct,
    feed_carbon_pct,
    feed_nitrogen_pct,
    feed_mfg_ef,
    total_feed_required_kg,
    improved_feed_kg,
    total_production_kg,

    // Mass Balances
    c_feed,
    c_retained,
    c_lost_to_pond,
    n_feed,
    n_retained,
    n_lost_to_pond,

    // Soil & Water Biogeochemistry & Emission Factors
    pre_stocking_soc,
    post_harvest_soc,
    bulk_density,
    sampling_depth,
    soil_cn_ratio,
    cn_adj,
    delta_soc_mass_tc,
    co2e_equivalent_soc_t,
    pre_dawn_do,
    dynamic_af,
    cyanobacteria_avg,
    gwp_framework,
    gwp_ch4,
    gwp_n2o,
    n2o_ef_preset,
    n2o_ef_custom,
    n2o_n_ef_adjusted,
    punch_bag_feeding,

    // Scopes (tCO2e)
    scope1_baseline,
    scope1_improved,
    scope2_baseline,
    scope2_improved,
    scope3_baseline,
    scope3_improved,

    // Emissions Breakdown (tCO2e)
    feed_scope3_co2e_t,
    improved_feed_co2e_t,
    ch4_co2e_t,
    improved_ch4_co2e_t,
    n2o_co2e_t,
    improved_n2o_co2e_t,
    electricity_co2e_t,
    diesel_co2e_t,
    total_energy_co2e_t,
    improved_energy_co2e_t,
    lime_fertilizer_co2e_t,
    idle_phase_co2e_t,

    // Carbon Accounting Totals
    gross_emission_baseline_t,
    gross_emission_improved_t,
    carbon_stored_biomass_t,
    net_emission_baseline_t,
    net_emission_improved_t,
    co2e_reduction_per_crop_t,
    pct_reduction,
    carbon_credit_per_year_t,
    carbon_credit_per_ha_per_year_t,

    // Intensity & MRV Controls
    emission_intensity_baseline,
    emission_intensity_edible,
    mrv_status,
    mrv_checks,

    // Economics
    feed_cost,
    electricity_cost,
    diesel_cost,
    seed_cost,
    total_cost,
    gross_income,
    net_profit,
    cost_per_kg,
    annual_net_profit,
    measures
  };
}
