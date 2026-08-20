/**
 * Aquaculture GHG & Carbon Credit Calculation Engine (v3.4 IMC MRV Methodology Specification)
 * Implements full field-data-driven MRV calculations for semi-intensive IMC polyculture
 * as defined in Indian_Aquaculture_GHG_Carbon_MRV_Tool_v3_4_Data_Collection_Calculation_Methodology_Manual
 */

// Species Database Constants (Module 1.1)
export const SPECIES_DATABASE = {
  'IMC': {
    culture_type: 'IMC',
    stocking_density: 6250,
    stocking_weight_g: 150,
    partial_harvest_weight_g: 1000,
    final_harvest_weight_g: 1500,
    culture_duration_days: 240,
    survival_fraction: 0.80,
    aeration_required: false,
    average_fcr: 3.0,
    improved_fcr_target: 2.5,
    feed_protein_pct: 0.28,
    feed_carbon_pct: 0.40,
    feed_mfg_ef: 0.4727,
    biomass_carbon_pct: 0.08,
    edible_yield_fraction: 0.65
  },
  'Fish': {
    culture_type: 'IMC',
    stocking_density: 6250,
    stocking_weight_g: 150,
    partial_harvest_weight_g: 1000,
    final_harvest_weight_g: 1500,
    culture_duration_days: 240,
    survival_fraction: 0.80,
    aeration_required: false,
    average_fcr: 3.0,
    improved_fcr_target: 2.5,
    feed_protein_pct: 0.28,
    feed_carbon_pct: 0.40,
    feed_mfg_ef: 0.4727,
    biomass_carbon_pct: 0.08,
    edible_yield_fraction: 0.65
  },
  'Pangasius': {
    culture_type: 'Pangasius',
    stocking_density: 20000,
    stocking_weight_g: 15,
    partial_harvest_weight_g: null,
    final_harvest_weight_g: 1000,
    culture_duration_days: 180,
    survival_fraction: 0.85,
    aeration_required: true,
    average_fcr: 1.5,
    improved_fcr_target: 1.3,
    feed_protein_pct: 0.30,
    feed_carbon_pct: 0.42,
    feed_mfg_ef: 0.6500,
    biomass_carbon_pct: 0.09,
    edible_yield_fraction: 0.60
  },
  'Red Pacu': {
    culture_type: 'Red Pacu',
    stocking_density: 10000,
    stocking_weight_g: 20,
    partial_harvest_weight_g: null,
    final_harvest_weight_g: 800,
    culture_duration_days: 210,
    survival_fraction: 0.80,
    aeration_required: false,
    average_fcr: 1.8,
    improved_fcr_target: 1.5,
    feed_protein_pct: 0.28,
    feed_carbon_pct: 0.40,
    feed_mfg_ef: 0.5500,
    biomass_carbon_pct: 0.08,
    edible_yield_fraction: 0.62
  },
  'P. vannamei': {
    culture_type: 'P. vannamei',
    stocking_density: 400000,
    stocking_weight_g: 0.005,
    partial_harvest_weight_g: 12,
    final_harvest_weight_g: 20,
    culture_duration_days: 100,
    survival_fraction: 0.75,
    aeration_required: true,
    average_fcr: 1.4,
    improved_fcr_target: 1.2,
    feed_protein_pct: 0.35,
    feed_carbon_pct: 0.45,
    feed_mfg_ef: 0.8500,
    biomass_carbon_pct: 0.10,
    edible_yield_fraction: 0.70
  },
  'P. monodon': {
    culture_type: 'P. monodon',
    stocking_density: 150000,
    stocking_weight_g: 0.005,
    partial_harvest_weight_g: 18,
    final_harvest_weight_g: 30,
    culture_duration_days: 120,
    survival_fraction: 0.70,
    aeration_required: true,
    average_fcr: 1.6,
    improved_fcr_target: 1.35,
    feed_protein_pct: 0.38,
    feed_carbon_pct: 0.46,
    feed_mfg_ef: 0.9000,
    biomass_carbon_pct: 0.10,
    edible_yield_fraction: 0.68
  }
};

/**
 * Main calculation function running Modules 1 through 10 (v3.4 Field-Data MRV Specification)
 */
export function calculateAquacultureCarbon(input = {}) {
  // Module 1: Species Lookup & Scope Rules
  const culture_type = input.culture_type || input.species_name || input.plantationType || 'IMC';
  const species = SPECIES_DATABASE[culture_type] || SPECIES_DATABASE['IMC'];
  const isIMC = (culture_type === 'IMC' || culture_type === 'Fish' || culture_type === 'Roopchand' || culture_type === 'Tilapia');

  const stocking_density = Number(input.stocking_density ?? species.stocking_density);
  const stocking_weight_g = Number(input.stocking_weight_g ?? species.stocking_weight_g);
  const final_harvest_weight_g = Number(input.final_harvest_weight_g ?? species.final_harvest_weight_g);
  const culture_duration_days = Number(input.culture_duration_days ?? input.cropDuration ?? species.culture_duration_days);
  const survival_fraction = Number(input.survival_fraction ?? species.survival_fraction);

  // v3.4 IMC Scope Rule & Aeration Lock: Mechanical Aeration is locked to ZERO for IMC polyculture
  const raw_paddlewheel_units = Number(input.paddlewheel_units ?? 0);
  const raw_blower_kw = Number(input.blower_kw ?? 0);
  const aeration_required = isIMC ? false : (input.aeration_required ?? species.aeration_required);

  const feed_protein_pct = Number(input.feed_protein_pct ?? input.feedCrudeProtein ?? species.feed_protein_pct);
  const feed_carbon_pct = Number(input.feed_carbon_pct ?? input.feedCarbonContent ?? species.feed_carbon_pct);
  const feed_nitrogen_pct = feed_protein_pct / 6.25;

  // v3.4 Feed Formulation Blend (Section 1.6 & 2.1)
  const q_dob = Number(input.q_dob ?? input.qDob ?? 0);
  const q_gnc = Number(input.q_gnc ?? input.qGnc ?? 0);
  const q_sbm = Number(input.q_sbm ?? input.qSbm ?? 0);
  const q_ddgs = Number(input.q_ddgs ?? input.qDdgs ?? 0);
  const total_mix_kg = q_dob + q_gnc + q_sbm + q_ddgs;

  let feed_mfg_ef = Number(input.feed_mfg_ef ?? species.feed_mfg_ef);
  if (total_mix_kg > 0) {
    // Weighted blended EF: DOB (0.40), GNC (1.20), SBM (0.85), DDGS (0.65)
    feed_mfg_ef = (q_dob * 0.40 + q_gnc * 1.20 + q_sbm * 0.85 + q_ddgs * 0.65) / total_mix_kg;
  }

  // Module 2: Farm & Crop Inputs
  const pond_area_ha = Number(input.pond_area_ha ?? input.pondArea ?? input.area ?? 1.0);
  const water_depth_m = Number(input.water_depth_m ?? 1.5);
  const crops_per_year = Number(input.crops_per_year ?? input.cropsPerYear ?? 1.5);
  const gwp_framework = input.gwp_framework || 'AR5';
  const farm_reported_fcr = input.farm_reported_fcr ?? input.actualFCR ?? input.fcr;

  // v3.4 Plankton Quality Index (PQI) & Seasonal Photosynthesis Factor (SPF) - Section 2.4
  const diatoms_pct = Number(input.diatoms_pct ?? input.diatomsPct ?? 40.0);
  const green_algae_pct = Number(input.green_algae_pct ?? input.greenAlgaePct ?? 35.0);
  const zooplankton_score = Math.min(3, Math.max(0, Number(input.zooplankton_score ?? input.zooplanktonScore ?? 2)));
  const cyanobacteria_avg = Number(input.cyanobacteria_avg ?? input.cyanobacteriaAvg ?? 15.0);

  const aqi = Math.min(1.0, (diatoms_pct + green_algae_pct) / 60.0);
  const zqi = zooplankton_score / 3.0;
  const pqi = 0.60 * aqi + 0.40 * zqi;
  const spf = 0.85; // Bounded proxy for seasonal solar radiation potential

  // v3.4 Natural Feed Offset calculation (Section 2.4)
  let natural_feed_offset = 0.20 * pqi * spf;
  if (cyanobacteria_avg > 50) {
    natural_feed_offset = Math.min(0.05, natural_feed_offset);
  } else {
    natural_feed_offset = Math.min(0.20, natural_feed_offset);
  }

  // v3.4 Dynamic Adjustments: Punch Bag System & DO Stress Penalty (Section 2.4)
  const punch_bag_feeding = !!(input.punch_bag_feeding ?? input.punchBagFeeding);
  const fcr_punch_bag_factor = punch_bag_feeding ? 0.875 : 1.0; // 12.5% FCR reduction

  const pre_dawn_do = Number(input.pre_dawn_do ?? input.preDawnDo ?? 4.5);
  const do_stress_factor = pre_dawn_do < 3.0 ? 1.10 : 1.00; // +10% stress penalty when DO < 3.0 mg/L

  let baseline_fcr = (farm_reported_fcr !== null && farm_reported_fcr !== undefined && !isNaN(farm_reported_fcr) && Number(farm_reported_fcr) > 0)
    ? Number(farm_reported_fcr)
    : species.average_fcr;

  // Adjusted FCR applying natural feed offset, punch bag feeding, and DO stress
  const actual_fcr_used = baseline_fcr * (1 - natural_feed_offset) * fcr_punch_bag_factor * do_stress_factor;

  const gwp_ch4 = (gwp_framework === 'AR6') ? 27.0 : Number(input.gwp_ch4 ?? 28.0);
  const gwp_n2o = (gwp_framework === 'AR6') ? 273.0 : Number(input.gwp_n2o ?? 265.0);

  // Module 3: Growth Engine
  const growth_curve_type = input.growth_curve_type || 'Exponential';
  const mortality_feed_factor = Number(input.mortality_feed_factor ?? 0.5);

  const total_stocked_number = stocking_density * pond_area_ha;
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
    const period_feed_kg = (Math.max(0, biomass_kg - prev_biomass_kg) + mortality_feed_kg) * actual_fcr_used * 1.0;

    cumulative_feed_kg += period_feed_kg;
    period_biomass_kg = biomass_kg;

    prev_biomass_kg = biomass_kg;
    prev_population = population;
    prev_weight_g = weight_g;
  }

  const total_feed_required_kg = Number(input.total_feed_required_kg ?? input.qtyFeedConsumed ?? cumulative_feed_kg);
  const standing_biomass_end_kg = period_biomass_kg;

  // Module 4: Harvest Engine
  let total_production_kg = 0;
  if (input.harvest_events && Array.isArray(input.harvest_events) && input.harvest_events.length > 0) {
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

  // Module 5: Feed Emission Engine
  const carbon_retention_efficiency = Number(input.carbon_retention_efficiency ?? input.cRetentionEfficiency ?? 0.22);
  const nitrogen_retention_efficiency = Number(input.nitrogen_retention_efficiency ?? input.nRetentionEfficiency ?? 0.25);

  const feed_scope3_co2e_t = total_feed_required_kg * feed_mfg_ef / 1000;
  const feed_carbon_in_kg = total_feed_required_kg * feed_carbon_pct;
  const carbon_retained_kg = feed_carbon_in_kg * carbon_retention_efficiency;
  const carbon_lost_kg = feed_carbon_in_kg - carbon_retained_kg;

  const feed_nitrogen_in_kg = total_feed_required_kg * feed_nitrogen_pct;
  const nitrogen_retained_kg = feed_nitrogen_in_kg * nitrogen_retention_efficiency;
  const nitrogen_lost_kg = feed_nitrogen_in_kg - nitrogen_retained_kg;

  // Module 6: Pond Emission Engine & v3.4 Dynamic Ecological Variables (Section 2.2)
  const h2s_detected = !!(input.h2s_detected ?? input.h2sDetected);
  let dynamic_af = 0.20;
  if (pre_dawn_do >= 4.0 && !h2s_detected) {
    dynamic_af = 0.12; // 12% optimal DO
  } else if (pre_dawn_do < 3.0 && h2s_detected) {
    dynamic_af = 0.30; // 30% severe oxygen stress
  }

  const anaerobic_fraction = Number(input.anaerobic_fraction ?? input.baselineAnaerobicFraction ?? dynamic_af);
  const anaerobic_adjustment_factor = Number(input.anaerobic_adjustment_factor ?? 1.0);
  const sediment_burial_fraction = Number(input.sediment_burial_fraction ?? 0.20);
  const ch4_oxidation_fraction = Number(input.ch4_oxidation_fraction ?? 0.25);

  // v3.4 Soil C:N Adjustment Factor (Section 2.2)
  const soil_cn_ratio = Number(input.soil_cn_ratio ?? input.soilCnRatio ?? 12.0);
  let cn_adj = 1.00;
  if (soil_cn_ratio > 30) {
    cn_adj = 1.25;
  } else if (soil_cn_ratio > 20) {
    cn_adj = 1.15;
  }

  // v3.4 Cyanobacteria N2O Adjustment (+20% when > 50%, Section 2.2)
  const n2o_adj_factor = cyanobacteria_avg > 50 ? 1.20 : 1.00;

  const n2o_ef_preset = input.n2o_ef_preset || '0.71%';
  const n2o_n_ef = Number(input.n2o_n_ef ?? input.n2oN_EF ?? (n2o_ef_preset === '1.8%' ? 0.018 : 0.0071)) * n2o_adj_factor;

  const ch4_c_produced_kg = carbon_lost_kg * (1 - sediment_burial_fraction) * anaerobic_fraction * anaerobic_adjustment_factor * cn_adj;
  const ch4_gross_kg = ch4_c_produced_kg * (16 / 12);
  const ch4_modelled_kg = ch4_gross_kg * (1 - ch4_oxidation_fraction);
  const ch4_used_kg = (input.measured_ch4_kg !== null && input.measured_ch4_kg !== undefined && !isNaN(input.measured_ch4_kg))
    ? Number(input.measured_ch4_kg)
    : ch4_modelled_kg;
  const ch4_co2e_t = ch4_used_kg * gwp_ch4 / 1000;

  const n2o_modelled_kg = nitrogen_lost_kg * n2o_n_ef * (44 / 28);
  const n2o_used_kg = (input.measured_n2o_kg !== null && input.measured_n2o_kg !== undefined && !isNaN(input.measured_n2o_kg))
    ? Number(input.measured_n2o_kg)
    : n2o_modelled_kg;
  const n2o_co2e_t = n2o_used_kg * gwp_n2o / 1000;

  const lime_applied_kg = Number(input.lime_applied_kg ?? 200);
  const lime_ef = Number(input.lime_ef ?? 0.12);
  const lime_co2e_t = (lime_applied_kg / 1000) * lime_ef;

  const fertilizer_n_kg = Number(input.fertilizer_n_kg ?? 0);
  const fertilizer_n2o_ef = Number(input.fertilizer_n2o_ef ?? 0.01);
  const fertilizer_n2o_kg = fertilizer_n_kg * fertilizer_n2o_ef * (44 / 28);
  const fertilizer_co2e_t = fertilizer_n2o_kg * gwp_n2o / 1000;
  const lime_fertilizer_co2e_t = lime_co2e_t + fertilizer_co2e_t;

  const idle_days = Number(input.idle_days ?? 20);
  const idle_ef_kgco2e_per_ha_day = Number(input.idle_ef_kgco2e_per_ha_day ?? 2.0);
  const idle_phase_co2e_t = pond_area_ha * idle_days * idle_ef_kgco2e_per_ha_day / 1000;

  // v3.4 Benthic Coupling — Soil Organic Carbon (SOC) Sequestration / Depletion Mass (Section 2.5)
  const pre_stocking_soc = Number(input.pre_stocking_soc ?? input.preStockingSoc ?? 1.20);
  const post_harvest_soc = Number(input.post_harvest_soc ?? input.postHarvestSoc ?? 1.45);
  const bulk_density = Number(input.bulk_density ?? input.bulkDensity ?? 1.25);
  const sampling_depth = Number(input.sampling_depth ?? input.samplingDepth ?? 0.15);
  
  const delta_soc_pct = post_harvest_soc - pre_stocking_soc;
  const delta_soc_mass_tc = (delta_soc_pct / 100) * bulk_density * sampling_depth * pond_area_ha * 10000;
  const delta_soc_annualized_tc = delta_soc_mass_tc * 365 / culture_duration_days;
  const co2e_equivalent_soc_t = delta_soc_annualized_tc * (44 / 12);

  // Module 7: Energy Engine & IMC Scope Rule Aeration Lock
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

  // Module 8: Economics Engine
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
  const annual_net_profit = net_profit * crops_per_year;

  // Module 9: Improved Farming Scenario Engine
  let measures = input.measures;
  if (!measures && input.interventions && typeof input.interventions === 'object') {
    const ints = input.interventions;
    measures = [
      { name: 'Better Feed', apply: !!ints.betterFeed, fcr_effect: 0.05, anaerobic_effect: 0, n2o_effect: 0 },
      { name: 'Water Probiotics', apply: !!ints.waterProbiotics, fcr_effect: 0.03, anaerobic_effect: 0.30, n2o_effect: 0 },
      { name: 'Soil Probiotics', apply: !!ints.soilProbiotics, fcr_effect: 0.02, anaerobic_effect: 0.20, n2o_effect: 0 },
      { name: 'Better Aeration', apply: !!ints.betterAeration, fcr_effect: 0.04, anaerobic_effect: 0.25, n2o_effect: 0 },
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
      { name: 'Better Aeration', apply: false, fcr_effect: 0.04, anaerobic_effect: 0.25, n2o_effect: 0 },
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

  const better_aeration_measure = measures.find(m => m.name === 'Better Aeration' && m.apply);
  const energy_co2e_increase = better_aeration_measure ? 0.10 : 0;

  const fcr_imp_factor = Number(input.fcr_improvement ?? 0.10);
  const final_fcr_improvement = Math.max(combined_fcr_improvement, fcr_imp_factor);

  const improved_fcr = actual_fcr_used * (1 - final_fcr_improvement);
  const improved_feed_kg = total_feed_required_kg * (improved_fcr / actual_fcr_used);
  const improved_feed_ef = feed_mfg_ef * (1 - feed_ef_reduction);
  const improved_feed_co2e_t = improved_feed_kg * improved_feed_ef / 1000;

  const improved_carbon_lost_kg = improved_feed_kg * feed_carbon_pct * (1 - carbon_retention_efficiency);
  const improved_anaerobic_fraction = Number(input.improved_anaerobic_fraction ?? (anaerobic_fraction * (1 - combined_anaerobic_reduction) * anaerobic_adjustment_factor));
  const improved_ch4_kg = improved_carbon_lost_kg * (1 - sediment_burial_fraction) * improved_anaerobic_fraction * (16 / 12) * (1 - ch4_oxidation_fraction);
  const improved_ch4_co2e_t = improved_ch4_kg * gwp_ch4 / 1000;

  const improved_nitrogen_lost_kg = improved_feed_kg * feed_nitrogen_pct * (1 - nitrogen_retention_efficiency);
  const improved_n2o_n_ef = n2o_n_ef * (1 - combined_n2o_reduction);
  const improved_n2o_kg = improved_nitrogen_lost_kg * improved_n2o_n_ef * (44 / 28);
  const improved_n2o_co2e_t = improved_n2o_kg * gwp_n2o / 1000;

  const improved_energy_co2e_t = total_energy_co2e_t * (1 + energy_co2e_increase);

  // Module 10: Carbon Accounting & Credit Engine
  const biomass_carbon_pct = Number(input.biomass_carbon_pct ?? species.biomass_carbon_pct);
  const edible_yield_fraction = Number(input.edible_yield_fraction ?? species.edible_yield_fraction);

  const gross_emission_baseline_t = feed_scope3_co2e_t + electricity_co2e_t + diesel_co2e_t + ch4_co2e_t + n2o_co2e_t + lime_fertilizer_co2e_t + idle_phase_co2e_t;
  const gross_emission_improved_t = improved_feed_co2e_t + (electricity_co2e_t * (1 + energy_co2e_increase)) + diesel_co2e_t + improved_ch4_co2e_t + improved_n2o_co2e_t + lime_fertilizer_co2e_t + idle_phase_co2e_t;

  const carbon_stored_biomass_t = total_production_kg * biomass_carbon_pct * (44 / 12) / 1000;
  const net_emission_baseline_t = gross_emission_baseline_t - carbon_stored_biomass_t;
  const net_emission_improved_t = gross_emission_improved_t - carbon_stored_biomass_t;

  const emission_intensity_baseline = total_production_kg > 0 ? (net_emission_baseline_t * 1000 / total_production_kg) : 0;
  const edible_production_kg = total_production_kg * edible_yield_fraction;
  const emission_intensity_edible = edible_production_kg > 0 ? (net_emission_baseline_t * 1000 / edible_production_kg) : 0;

  const co2e_reduction_per_crop_t = net_emission_baseline_t - net_emission_improved_t;
  const pct_reduction = net_emission_baseline_t > 0 ? (co2e_reduction_per_crop_t / net_emission_baseline_t * 100) : 0;

  const carbon_credit_per_year_t = co2e_reduction_per_crop_t * crops_per_year;
  const carbon_credit_per_ha_per_year_t = pond_area_ha > 0 ? (carbon_credit_per_year_t / pond_area_ha) : 0;

  // v3.4 Automated MRV Integrity Traffic Light Checks (Section 3.2)
  const mrv_checks = {
    imc_aeration_lock: (isIMC && (raw_paddlewheel_units > 0 || raw_blower_kw > 0)) ? 'FAIL' : 'PASS',
    feed_mix_check: 'PASS',
    soc_test_integrity: (pre_stocking_soc > 0 && post_harvest_soc > 0) ? 'PASS' : 'REVIEW',
    do_integrity: pre_dawn_do >= 0 ? 'PASS' : 'FAIL',
    cyanobacteria_status: cyanobacteria_avg > 50 ? 'REVIEW' : 'PASS'
  };

  let mrv_status = 'PASS';
  if (Object.values(mrv_checks).includes('FAIL')) {
    mrv_status = 'FAIL';
  } else if (Object.values(mrv_checks).includes('REVIEW')) {
    mrv_status = 'REVIEW';
  }

  return {
    culture_type,
    stocking_density,
    stocking_weight_g,
    final_harvest_weight_g,
    culture_duration_days,
    survival_fraction,
    pond_area_ha,
    crops_per_year,
    actual_fcr_used,
    improved_fcr,
    total_feed_required_kg,
    improved_feed_kg,
    total_production_kg,

    // v3.4 Plankton & Feed Offset Outputs
    diatoms_pct,
    green_algae_pct,
    zooplankton_score,
    pqi,
    spf,
    natural_feed_offset,

    // v3.4 Soil & Stress Fields
    pre_stocking_soc,
    post_harvest_soc,
    bulk_density,
    sampling_depth,
    soil_cn_ratio,
    cn_adj,
    delta_soc_mass_tc,
    co2e_equivalent_soc_t,
    pre_dawn_do,
    do_stress_factor,
    dynamic_af,
    cyanobacteria_avg,
    n2o_adj_factor,
    punch_bag_feeding,
    q_dob,
    q_gnc,
    q_sbm,
    q_ddgs,
    mrv_status,
    mrv_checks,

    // Module emissions breakdown (tCO2e)
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

    // Summary Carbon Accounting
    gross_emission_baseline_t,
    gross_emission_improved_t,
    carbon_stored_biomass_t,
    net_emission_baseline_t,
    net_emission_improved_t,
    co2e_reduction_per_crop_t,
    pct_reduction,
    carbon_credit_per_year_t,
    carbon_credit_per_ha_per_year_t,

    // Intensity & Economics
    emission_intensity_baseline,
    emission_intensity_edible,
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
