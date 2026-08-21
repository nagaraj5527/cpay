import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CarbonCalculatorInputs {
  cultureType?: string;
  pondArea?: number;
  cropsPerYear?: number;
  stockingDensity?: number;
  stockingWeightG?: number;
  finalHarvestWeightG?: number;
  cultureDurationDays?: number;
  cropDuration?: number;
  survivalFraction?: number;
  gwpFramework?: string;
  averageFcr?: number;
  farmReportedFcr?: number;
  fcr?: number;
  fcrImprovement?: number;
  feedConsumed?: number;
  growthCurveType?: string;
  mortalityFeedFactor?: number;
  feedProtein?: number;
  feedCarbon?: number;
  feedMfgEF?: number;
  anaerobicBaseline?: number;
  anaerobicAdjustmentFactor?: number;
  sedimentBurialFraction?: number;
  ch4OxidationFraction?: number;
  n2oEF?: number;
  measuredCH4Baseline?: number | null;
  measuredN2OBaseline?: number | null;
  limeAppliedKg?: number;
  limeEf?: number;
  fertilizerNKg?: number;
  fertilizerN2oEf?: number;
  idleDays?: number;
  idleEfKgco2ePerHaDay?: number;
  paddlewheelHp?: number;
  paddlewheelUnits?: number;
  paddlewheelHours?: number;
  blowerKw?: number;
  blowerHours?: number;
  salePrice?: number;
  interventions?: {
    betterFeed?: boolean;
    waterProbiotics?: boolean;
    soilProbiotics?: boolean;
    betterAeration?: boolean;
    waterQualityMgmt?: boolean;
    optimizedFeeding?: boolean;
    cnRatioMgmt?: boolean;
  };
  zooplanktonScore?: number;
  [key: string]: any;
}

export interface CalculatorResults {
  inputs: any;
  farmSummary: any;
  baseline: any;
  improved: any;
  summary: any;
  economics: any;
  mrvChecks?: any;
  mrvStatus?: string;
}

export const SPECIES_DEFAULTS: Record<string, any> = {
  "IMC": {
    cultureType: "IMC",
    speciesName: "Indian Major Carp (Rohu, Catla, Mrigal)",
    stockingDensity: 6250,
    stockingWeightG: 150,
    finalHarvestWeightG: 1500,
    cultureDurationDays: 240,
    survivalFraction: 0.80,
    fcrBaseline: 3.0,
    feedProtein: 0.28,
    feedCarbon: 0.40,
    feedMfgEF: 0.4727,
    nitrogenRetention: 0.25,
    carbonRetention: 0.22,
    anaerobicBaseline: 0.20,
    n2oEF: 0.0071,
    gridElectricityKwh: 500,
    dieselL: 500,
    seedPrice: 3.5,
    feedPrice: 45,
    salePrice: 130,
    labourCost: 60000,
    probioticsCost: 25000,
    otherCosts: 20000
  },
  "Fish": {
    cultureType: "IMC",
    speciesName: "Indian Major Carp (Rohu, Catla, Mrigal)",
    stockingDensity: 6250,
    stockingWeightG: 150,
    finalHarvestWeightG: 1500,
    cultureDurationDays: 240,
    survivalFraction: 0.80,
    fcrBaseline: 3.0,
    feedProtein: 0.28,
    feedCarbon: 0.40,
    feedMfgEF: 0.4727,
    nitrogenRetention: 0.25,
    carbonRetention: 0.22,
    anaerobicBaseline: 0.20,
    n2oEF: 0.0071,
    gridElectricityKwh: 500,
    dieselL: 500,
    seedPrice: 3.5,
    feedPrice: 45,
    salePrice: 130,
    labourCost: 60000,
    probioticsCost: 25000,
    otherCosts: 20000
  },
  "Pangasius": {
    cultureType: "Pangasius",
    speciesName: "Pangasius (Striped Catfish)",
    stockingDensity: 20000,
    stockingWeightG: 15,
    finalHarvestWeightG: 1000,
    cultureDurationDays: 180,
    survivalFraction: 0.85,
    fcrBaseline: 1.5,
    feedProtein: 0.30,
    feedCarbon: 0.42,
    feedMfgEF: 0.6500,
    nitrogenRetention: 0.25,
    carbonRetention: 0.22,
    anaerobicBaseline: 0.25,
    n2oEF: 0.0071,
    gridElectricityKwh: 4000,
    dieselL: 1200,
    seedPrice: 4.0,
    feedPrice: 48,
    salePrice: 110,
    labourCost: 70000,
    probioticsCost: 30000,
    otherCosts: 25000
  },
  "Red Pacu": {
    cultureType: "Red Pacu",
    speciesName: "Roopchand (Red Pacu)",
    stockingDensity: 10000,
    stockingWeightG: 20,
    finalHarvestWeightG: 800,
    cultureDurationDays: 210,
    survivalFraction: 0.80,
    fcrBaseline: 1.8,
    feedProtein: 0.28,
    feedCarbon: 0.40,
    feedMfgEF: 0.5500,
    nitrogenRetention: 0.25,
    carbonRetention: 0.22,
    anaerobicBaseline: 0.22,
    n2oEF: 0.0071,
    gridElectricityKwh: 3000,
    dieselL: 1000,
    seedPrice: 2.0,
    feedPrice: 46,
    salePrice: 120,
    labourCost: 65000,
    probioticsCost: 28000,
    otherCosts: 22000
  },
  "P. vannamei": {
    cultureType: "P. vannamei",
    speciesName: "Pacific White Shrimp (P. vannamei)",
    stockingDensity: 400000,
    stockingWeightG: 0.005,
    finalHarvestWeightG: 20,
    cultureDurationDays: 100,
    survivalFraction: 0.75,
    fcrBaseline: 1.4,
    feedProtein: 0.35,
    feedCarbon: 0.45,
    feedMfgEF: 0.8500,
    nitrogenRetention: 0.28,
    carbonRetention: 0.25,
    anaerobicBaseline: 0.15,
    n2oEF: 0.0071,
    gridElectricityKwh: 12000,
    dieselL: 2500,
    seedPrice: 0.40,
    feedPrice: 85,
    salePrice: 380,
    labourCost: 90000,
    probioticsCost: 50000,
    otherCosts: 35000
  },
  "P. monodon": {
    cultureType: "P. monodon",
    speciesName: "Giant Tiger Prawn (P. monodon)",
    stockingDensity: 150000,
    stockingWeightG: 0.005,
    finalHarvestWeightG: 30,
    cultureDurationDays: 120,
    survivalFraction: 0.70,
    fcrBaseline: 1.6,
    feedProtein: 0.38,
    feedCarbon: 0.46,
    feedMfgEF: 0.9000,
    nitrogenRetention: 0.28,
    carbonRetention: 0.25,
    anaerobicBaseline: 0.18,
    n2oEF: 0.0071,
    gridElectricityKwh: 10000,
    dieselL: 2000,
    seedPrice: 0.60,
    feedPrice: 95,
    salePrice: 520,
    labourCost: 85000,
    probioticsCost: 45000,
    otherCosts: 30000
  }
};

export const INGREDIENT_DEFAULTS: Record<string, any> = {
  DOB: { name: 'Deoiled Rice Bran', protein_pct: 0.12, carbon_pct: 0.40, nitrogen_pct: 0.0192, ef_kgco2e_per_kg: 0.40 },
  GNC: { name: 'Groundnut Cake', protein_pct: 0.40, carbon_pct: 0.45, nitrogen_pct: 0.0640, ef_kgco2e_per_kg: 1.20 },
  SBM: { name: 'Soybean Meal', protein_pct: 0.44, carbon_pct: 0.46, nitrogen_pct: 0.0704, ef_kgco2e_per_kg: 0.85 },
  DDGS: { name: 'Distillers Dried Grains with Solubles', protein_pct: 0.28, carbon_pct: 0.42, nitrogen_pct: 0.0448, ef_kgco2e_per_kg: 0.65 }
};

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {
  private apiUrl = `${environment.apiUrl}/calculator`;

  constructor(private http: HttpClient) {}

  calculateOnBackend(inputs: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/calculate`, inputs);
  }

  getDefaults(cultureType: string = 'IMC'): Observable<any> {
    return this.http.get(`${this.apiUrl}/defaults?type=${cultureType}`);
  }

  calculateOnFrontend(input: any): any {
    const culture_type = input.cultureType || input.selectedSpecies || input.species_name || 'IMC';
    const species = SPECIES_DEFAULTS[culture_type] || SPECIES_DEFAULTS['IMC'];
    const isIMC = (culture_type === 'IMC' || culture_type === 'Fish' || culture_type === 'Roopchand' || culture_type === 'Tilapia');

    const stocking_density = Number(input.stockingDensity ?? species.stockingDensity ?? 6250);
    const seed_quantity = Number(input.seed_quantity ?? input.seedQuantity ?? input.quantity ?? (stocking_density * (input.pondArea ?? input.pondAreaHa ?? 1.0)));
    const stocking_weight_g = Number(input.stockingWeightG ?? species.stockingWeightG ?? 150);
    const final_harvest_weight_g = Number(input.finalHarvestWeightG ?? species.finalHarvestWeightG ?? 1500);
    const culture_duration_days = Number(input.cultureDurationDays ?? species.cultureDurationDays ?? 240);
    const survival_fraction = Number(input.survivalFraction ?? species.survivalFraction ?? 0.80);

    const pond_area_ha = Number(input.pondArea ?? input.pondAreaHa ?? 1.0);
    const crops_per_year = Number(input.cropsPerYear ?? 1.5);
    const gwp_framework = input.gwpFramework || 'AR5';
    const farm_reported_fcr = input.farmReportedFcr ?? input.averageFcr ?? species.fcrBaseline;

    // Aeration Lock for IMC Configuration
    const raw_paddlewheel_units = Number(input.paddlewheelUnits ?? 0);
    const raw_blower_kw = Number(input.blowerKw ?? 0);
    const aeration_required = isIMC ? false : (input.aeration_required ?? species.aeration_required);

    // v3.4 Feed Ingredients Blend
    const q_dob = Number(input.qDob ?? input.q_dob ?? 0);
    const q_gnc = Number(input.qGnc ?? input.q_gnc ?? 0);
    const q_sbm = Number(input.qSbm ?? input.q_sbm ?? 0);
    const q_ddgs = Number(input.qDdgs ?? input.q_ddgs ?? 0);
    const feed_mix_total_kg = q_dob + q_gnc + q_sbm + q_ddgs;

    let feed_protein_pct = Number(input.feedProtein ?? species.feedProtein ?? 0.28);
    let feed_carbon_pct = Number(input.feedCarbon ?? species.feedCarbon ?? 0.40);
    let feed_nitrogen_pct = feed_protein_pct / 6.25;
    let feed_mfg_ef = Number(input.feedMfgEF ?? species.feedMfgEF ?? 0.4727);

    if (feed_mix_total_kg > 0) {
      feed_protein_pct = (q_dob * INGREDIENT_DEFAULTS['DOB'].protein_pct +
                          q_gnc * INGREDIENT_DEFAULTS['GNC'].protein_pct +
                          q_sbm * INGREDIENT_DEFAULTS['SBM'].protein_pct +
                          q_ddgs * INGREDIENT_DEFAULTS['DDGS'].protein_pct) / feed_mix_total_kg;

      feed_carbon_pct = (q_dob * INGREDIENT_DEFAULTS['DOB'].carbon_pct +
                         q_gnc * INGREDIENT_DEFAULTS['GNC'].carbon_pct +
                         q_sbm * INGREDIENT_DEFAULTS['SBM'].carbon_pct +
                         q_ddgs * INGREDIENT_DEFAULTS['DDGS'].carbon_pct) / feed_mix_total_kg;

      feed_nitrogen_pct = (q_dob * INGREDIENT_DEFAULTS['DOB'].nitrogen_pct +
                           q_gnc * INGREDIENT_DEFAULTS['GNC'].nitrogen_pct +
                           q_sbm * INGREDIENT_DEFAULTS['SBM'].nitrogen_pct +
                           q_ddgs * INGREDIENT_DEFAULTS['DDGS'].nitrogen_pct) / feed_mix_total_kg;

      feed_mfg_ef = (q_dob * INGREDIENT_DEFAULTS['DOB'].ef_kgco2e_per_kg +
                     q_gnc * INGREDIENT_DEFAULTS['GNC'].ef_kgco2e_per_kg +
                     q_sbm * INGREDIENT_DEFAULTS['SBM'].ef_kgco2e_per_kg +
                     q_ddgs * INGREDIENT_DEFAULTS['DDGS'].ef_kgco2e_per_kg) / feed_mix_total_kg;
    }

    // v3.4 Ecological Adjustments: Plankton, Natural Feed Offset, Punch Bag & DO Stress
    const punch_bag_feeding = !!(input.punchBagFeeding ?? input.punch_bag_feeding);
    const fcr_punch_bag_factor = punch_bag_feeding ? 0.875 : 1.0;

    const pre_dawn_do = Number(input.preDawnDo ?? input.pre_dawn_do ?? 4.5);
    const do_stress_factor = pre_dawn_do < 3.0 ? 1.10 : 1.00;

    const diatoms_pct = Number(input.diatomsPct ?? input.diatoms_pct ?? 40.0);
    const green_algae_pct = Number(input.greenAlgaePct ?? input.green_algae_pct ?? 35.0);
    const zooplankton_score = Math.min(3, Math.max(0, Number(input.zooplanktonScore ?? input.zooplankton_score ?? 2)));
    const cyanobacteria_avg = Number(input.cyanobacteriaAvg ?? input.cyanobacteria_avg ?? 15.0);

    const aqi = Math.min(1.0, (diatoms_pct + green_algae_pct) / 60.0);
    const zqi = zooplankton_score / 3.0;
    const pqi = 0.60 * aqi + 0.40 * zqi;
    const spf = 0.85;

    let natural_feed_offset = 0.20 * pqi * spf;
    if (cyanobacteria_avg > 50) {
      natural_feed_offset = Math.min(0.05, natural_feed_offset);
    } else {
      natural_feed_offset = Math.min(0.20, natural_feed_offset);
    }

    let baseline_fcr = (farm_reported_fcr !== null && farm_reported_fcr !== undefined && !isNaN(farm_reported_fcr) && Number(farm_reported_fcr) > 0)
      ? Number(farm_reported_fcr)
      : (species.fcrBaseline || 3.0);

    const actual_fcr_used = baseline_fcr * (1 - natural_feed_offset) * fcr_punch_bag_factor * do_stress_factor;

    const gwp_ch4 = (gwp_framework === 'AR6') ? 27.0 : Number(input.gwpCH4 ?? 28.0);
    const gwp_n2o = (gwp_framework === 'AR6') ? 273.0 : Number(input.gwpN2O ?? 265.0);

    const growth_curve_type = input.growthCurveType || 'Exponential';
    const mortality_feed_factor = Number(input.mortalityFeedFactor ?? 0.5);

    const total_stocked_number = seed_quantity > 0 ? seed_quantity : (stocking_density * pond_area_ha);
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

    const total_feed_required_kg = Number(input.total_feed_required_kg ?? input.totalFeedRequiredKg ?? input.qtyFeedConsumed ?? input.feedConsumed ?? cumulative_feed_kg);
    const standing_biomass_end_kg = period_biomass_kg;
    const total_production_kg = standing_biomass_end_kg;

    // Mass Balances & Emissions
    const carbon_retention_efficiency = Number(input.carbonRetention ?? species.carbonRetention ?? 0.22);
    const nitrogen_retention_efficiency = Number(input.nitrogenRetention ?? species.nitrogenRetention ?? 0.25);

    const feed_scope3_co2e_t = (total_feed_required_kg * feed_mfg_ef) / 1000;

    const c_feed = total_feed_required_kg * feed_carbon_pct;
    const c_retained = total_production_kg * (species.fish_biomass_carbon_fraction || 0.08);
    const c_lost_to_pond = Math.max(0, c_feed - c_retained);

    const n_feed = total_feed_required_kg * feed_nitrogen_pct;
    const n_retained = total_production_kg * (species.fish_biomass_nitrogen_fraction || 0.025);
    const n_lost_to_pond = Math.max(0, n_feed - n_retained);

    // Dynamic Anaerobic Fraction & Soil C:N
    const h2s_detected = !!(input.h2sDetected ?? input.h2s_detected);
    let dynamic_af = 0.20;
    if (pre_dawn_do >= 4.0 && !h2s_detected) {
      dynamic_af = 0.12;
    } else if (pre_dawn_do < 3.0 && h2s_detected) {
      dynamic_af = 0.30;
    }

    const anaerobic_fraction = Number(input.anaerobicBaseline ?? input.anaerobicFraction ?? dynamic_af);
    const anaerobic_adjustment_factor = Number(input.anaerobicAdjustmentFactor ?? 1.0);
    const sediment_burial_fraction = Number(input.sedimentBurialFraction ?? 0.20);
    const ch4_oxidation_fraction = Number(input.ch4OxidationFraction ?? 0.25);

    const soil_cn_ratio = Number(input.soilCnRatio ?? input.soil_cn_ratio ?? 12.0);
    let cn_adj = 1.00;
    if (soil_cn_ratio > 30) {
      cn_adj = 1.25;
    } else if (soil_cn_ratio > 20) {
      cn_adj = 1.15;
    }

    const cyanobacteria_n2o_adj = cyanobacteria_avg > 50 ? 1.20 : 1.00;
    const n2o_n_ef = Number(input.n2oEF ?? 0.0071) * cyanobacteria_n2o_adj;

    const c_anaerobic = c_lost_to_pond * anaerobic_fraction * anaerobic_adjustment_factor * cn_adj;
    const c_available_ch4 = c_anaerobic * (1 - sediment_burial_fraction);
    const ch4_emitted_kg = c_available_ch4 * 0.50 * (16 / 12) * (1 - ch4_oxidation_fraction);

    const ch4_used_kg = Number(input.measuredCH4Baseline ?? ch4_emitted_kg);
    const ch4_co2e_t = (ch4_used_kg * gwp_ch4) / 1000;

    const n2o_emitted_kg = n_lost_to_pond * n2o_n_ef * (44 / 28);
    const n2o_used_kg = Number(input.measuredN2OBaseline ?? n2o_emitted_kg);
    const n2o_co2e_t = (n2o_used_kg * gwp_n2o) / 1000;

    const lime_applied_kg = Number(input.limeAppliedKg ?? 200);
    const lime_ef = Number(input.limeEf ?? 0.12);
    const lime_co2e_t = (lime_applied_kg / 1000) * lime_ef;

    const fertilizer_n_kg = Number(input.fertilizerNKg ?? 0);
    const fertilizer_n2o_ef = Number(input.fertilizerN2oEf ?? 0.01);
    const fertilizer_n2o_kg = fertilizer_n_kg * fertilizer_n2o_ef * (44 / 28);
    const fertilizer_co2e_t = (fertilizer_n2o_kg * gwp_n2o) / 1000;
    const lime_fertilizer_co2e_t = lime_co2e_t + fertilizer_co2e_t;

    const idle_days = Number(input.idleDays ?? 20);
    const idle_ef_kgco2e_per_ha_day = Number(input.idleEfKgco2ePerHaDay ?? 2.0);
    const idle_phase_co2e_t = (pond_area_ha * idle_days * idle_ef_kgco2e_per_ha_day) / 1000;

    // Energy (Aeration Locked to 0 for IMC)
    const paddlewheel_hp = isIMC ? 0 : Number(input.paddlewheelHp ?? 2);
    const paddlewheel_units = isIMC ? 0 : Number(input.paddlewheelUnits ?? (aeration_required ? 4 : 0));
    const paddlewheel_hours = isIMC ? 0 : Number(input.paddlewheelHours ?? (aeration_required ? 8 : 0));
    const paddlewheel_kwh = paddlewheel_hp * 0.746 * paddlewheel_units * paddlewheel_hours;

    const blower_kw = isIMC ? 0 : Number(input.blowerKw ?? 0);
    const blower_hours = isIMC ? 0 : Number(input.blowerHours ?? 0);
    const blower_kwh = blower_kw * blower_hours;

    const grid_kwh = Number(input.gridElectricityKwh ?? input.gridKwh ?? 500);
    const solar_offset_kwh = Number(input.solarOffsetKwh ?? 0);
    const total_electricity_kwh = Math.max(0, paddlewheel_kwh + blower_kwh + grid_kwh - solar_offset_kwh);

    const grid_ef = Number(input.gridEf ?? 0.710);
    const electricity_co2e_t = (total_electricity_kwh * grid_ef) / 1000;

    const diesel_l = Number(input.dieselBaseline ?? input.dieselL ?? 500);
    const generator_diesel_l = Number(input.generatorDieselL ?? 200);
    const diesel_ef = Number(input.dieselEf ?? 3.0);
    const diesel_co2e_t = ((diesel_l + generator_diesel_l) * diesel_ef) / 1000;
    const total_energy_co2e_t = electricity_co2e_t + diesel_co2e_t;

    // Interventions & Measures (Module 39)
    // Note: Better Aeration is REMOVED / DISABLED for IMC configuration
    const interventions = input.interventions || {};
    let fcrMultiplier = 1.0;
    let anaerobicMultiplier = 1.0;
    let n2oMultiplier = 1.0;
    let feedEfMultiplier = 1.0;

    if (interventions.betterFeed) { fcrMultiplier *= 0.95; feedEfMultiplier *= 0.95; }
    if (interventions.waterProbiotics) { fcrMultiplier *= 0.95; anaerobicMultiplier *= 0.80; }
    if (interventions.soilProbiotics) { fcrMultiplier *= 0.95; anaerobicMultiplier *= 0.80; }
    if (!isIMC && interventions.betterAeration) { fcrMultiplier *= 0.95; anaerobicMultiplier *= 0.70; }
    if (interventions.waterQualityMgmt) { fcrMultiplier *= 0.95; n2oMultiplier *= 0.80; }
    if (interventions.optimizedFeeding) { fcrMultiplier *= 0.95; }
    if (interventions.cnRatioMgmt) { anaerobicMultiplier *= 0.80; n2oMultiplier *= 0.85; }

    const combined_fcr_improvement = 1 - fcrMultiplier;
    const combined_anaerobic_reduction = 1 - anaerobicMultiplier;
    const combined_n2o_reduction = 1 - n2oMultiplier;

    const feed_ef_reduction = interventions.betterFeed ? 0.05 : 0;
    const fcr_imp_factor = Number(input.fcr_improvement ?? input.fcrImprovement ?? 0.10);
    const final_fcr_improvement = Math.max(combined_fcr_improvement, fcr_imp_factor);

    const improved_fcr = actual_fcr_used * (1 - final_fcr_improvement);
    const improved_feed_kg = total_feed_required_kg * (improved_fcr / actual_fcr_used);
    const improved_feed_ef = feed_mfg_ef * (1 - feed_ef_reduction);
    const improved_feed_co2e_t = (improved_feed_kg * improved_feed_ef) / 1000;

    const improved_c_feed = improved_feed_kg * feed_carbon_pct;
    const improved_c_retained = total_production_kg * (species.fish_biomass_carbon_fraction || 0.08);
    const improved_c_lost_to_pond = Math.max(0, improved_c_feed - improved_c_retained);

    const improved_anaerobic_fraction = Number(input.improved_anaerobic_fraction ?? input.improvedAnaerobicFraction ?? (anaerobic_fraction * (1 - combined_anaerobic_reduction) * anaerobic_adjustment_factor));
    const improved_ch4_kg = improved_c_lost_to_pond * improved_anaerobic_fraction * cn_adj * 0.50 * (16 / 12) * (1 - ch4_oxidation_fraction);
    const improved_ch4_co2e_t = (improved_ch4_kg * gwp_ch4) / 1000;

    const improved_n_feed = improved_feed_kg * feed_nitrogen_pct;
    const improved_n_retained = total_production_kg * (species.fish_biomass_nitrogen_fraction || 0.025);
    const improved_n_lost_to_pond = Math.max(0, improved_n_feed - improved_n_retained);

    const improved_n2o_n_ef = n2o_n_ef * (1 - combined_n2o_reduction);
    const improved_n2o_kg = improved_n_lost_to_pond * improved_n2o_n_ef * (44 / 28);
    const improved_n2o_co2e_t = (improved_n2o_kg * gwp_n2o) / 1000;

    const improved_energy_co2e_t = total_energy_co2e_t;

    // Carbon Accounting & Reductions
    const gross_emission_baseline_t = feed_scope3_co2e_t + total_energy_co2e_t + ch4_co2e_t + n2o_co2e_t + lime_fertilizer_co2e_t + idle_phase_co2e_t;
    const gross_emission_improved_t = improved_feed_co2e_t + improved_energy_co2e_t + improved_ch4_co2e_t + improved_n2o_co2e_t + lime_fertilizer_co2e_t + idle_phase_co2e_t;

    const biomass_carbon_pct = Number(input.biomassCarbonPct ?? 0.08);
    const carbon_stored_biomass_t = (total_production_kg * biomass_carbon_pct * (44 / 12)) / 1000;

    const net_emission_baseline_t = gross_emission_baseline_t - carbon_stored_biomass_t;
    const net_emission_improved_t = gross_emission_improved_t - carbon_stored_biomass_t;

    const emission_intensity_baseline = total_production_kg > 0 ? (net_emission_baseline_t * 1000) / total_production_kg : 0;
    const co2e_reduction_per_crop_t = Math.max(0, gross_emission_baseline_t - gross_emission_improved_t);
    const pct_reduction = gross_emission_baseline_t > 0 ? (co2e_reduction_per_crop_t / gross_emission_baseline_t) * 100 : 0;
    const carbon_credit_per_year_t = co2e_reduction_per_crop_t * crops_per_year;
    const carbon_credit_per_ha_per_year_t = pond_area_ha > 0 ? carbon_credit_per_year_t / pond_area_ha : 0;

    // Economics
    const feed_price = Number(input.feedPrice ?? 45);
    const seed_price = Number(input.seedPrice ?? 3.5);
    const sale_price = Number(input.salePrice ?? 130);
    const electricity_tariff = Number(input.electricityTariff ?? 7.0);
    const diesel_price = Number(input.dieselPrice ?? 92.0);
    const labour_cost = Number(input.labourCost ?? 60000);
    const probiotics_cost = Number(input.probioticsCost ?? 25000);
    const other_costs = Number(input.otherCosts ?? 20000);

    const feed_cost = total_feed_required_kg * feed_price;
    const electricity_cost = total_electricity_kwh * electricity_tariff;
    const diesel_cost = (diesel_l + generator_diesel_l) * diesel_price;
    const seed_cost = total_stocked_number * seed_price;
    const total_cost = feed_cost + electricity_cost + diesel_cost + seed_cost + labour_cost + probiotics_cost + other_costs;
    const gross_income = total_production_kg * sale_price;
    const net_profit = gross_income - total_cost;
    const cost_per_kg = total_production_kg > 0 ? total_cost / total_production_kg : 0;

    // MRV Traffic Lights
    const mrv_checks = {
      imc_aeration_lock: (isIMC && (raw_paddlewheel_units > 0 || raw_blower_kw > 0)) ? 'FAIL' : 'PASS',
      feed_mix_check: (feed_mix_total_kg === 0 || Math.abs((q_dob + q_gnc + q_sbm + q_ddgs) - feed_mix_total_kg) <= 0.01) ? 'PASS' : 'FAIL',
      soc_test_integrity: (Number(input.preStockingSoc ?? 1.20) > 0 && Number(input.postHarvestSoc ?? 1.45) > 0) ? 'PASS' : 'REVIEW',
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
      inputs: {
        ...input,
        improvedFcr: improved_fcr
      },
      farmSummary: {
        cultureType: culture_type,
        pondAreaHa: pond_area_ha,
        cropsPerYear: crops_per_year,
        totalBiomassHarvestedKg: total_production_kg,
        totalFeedRequiredKg: total_feed_required_kg,
        actualFcrUsed: actual_fcr_used
      },
      baseline: {
        feedRequiredKg: total_feed_required_kg,
        feedScope3CO2e: feed_scope3_co2e_t,
        electricityCO2e: electricity_co2e_t,
        dieselCO2e: diesel_co2e_t,
        ch4CO2e: ch4_co2e_t,
        n2oCO2e: n2o_co2e_t,
        energyCO2e: total_energy_co2e_t,
        grossEmission: gross_emission_baseline_t,
        totalFootprint: gross_emission_baseline_t,
        biomassCarbonStoredCO2e: carbon_stored_biomass_t,
        netEmission: net_emission_baseline_t,
        emissionIntensity: emission_intensity_baseline
      },
      improved: {
        feedRequiredKg: improved_feed_kg,
        feedScope3CO2e: improved_feed_co2e_t,
        electricityCO2e: electricity_co2e_t,
        dieselCO2e: diesel_co2e_t,
        ch4CO2e: improved_ch4_co2e_t,
        n2oCO2e: improved_n2o_co2e_t,
        energyCO2e: improved_energy_co2e_t,
        grossEmission: gross_emission_improved_t,
        totalFootprint: gross_emission_improved_t,
        biomassCarbonStoredCO2e: carbon_stored_biomass_t,
        netEmission: net_emission_improved_t,
        emissionIntensity: emission_intensity_baseline
      },
      summary: {
        creditsPerCrop: co2e_reduction_per_crop_t,
        percentReduction: pct_reduction,
        creditsPerYear: carbon_credit_per_year_t,
        creditsPerHaPerYear: carbon_credit_per_ha_per_year_t,
        biomassCarbonStoredCO2e: carbon_stored_biomass_t,
        netEmissionBaseline: net_emission_baseline_t,
        netEmissionImproved: net_emission_improved_t,
        emissionIntensityBaseline: emission_intensity_baseline,
        emissionIntensityEdible: total_production_kg * (species.edible_yield_fraction || 0.65) > 0 ? (net_emission_baseline_t * 1000) / (total_production_kg * (species.edible_yield_fraction || 0.65)) : 0
      },
      growthSummary: {
        standingBiomassEndKg: standing_biomass_end_kg,
        harvestVariancePct: standing_biomass_end_kg > 0 ? ((total_production_kg - standing_biomass_end_kg) / standing_biomass_end_kg) * 100 : 0,
        edibleProductionKg: total_production_kg * (species.edible_yield_fraction || 0.65)
      },
      economics: {
        feedCostBaseline: feed_cost,
        seedCost: seed_cost,
        electricityCost: electricity_cost,
        dieselCost: diesel_cost,
        totalCostBaseline: total_cost,
        grossIncome: gross_income,
        netProfitBaseline: net_profit,
        costPerKgBaseline: cost_per_kg
      },
      mrvChecks: mrv_checks,
      mrvStatus: mrv_status
    };
  }

  calculateMultiPond(ponds: any[], marketRateOverride: number = 120): any {
    if (!ponds || !Array.isArray(ponds) || ponds.length === 0) {
      return {
        pondResults: [],
        overallSummary: {
          totalCO2Reduction: 0,
          totalCarbonCredits: 0,
          totalProductionKg: 0,
          totalAreaHa: 0,
          currentMarketRate: marketRateOverride,
          portfolioValue: 0
        }
      };
    }

    const pondResults: any[] = [];
    let totalCO2Reduction = 0;
    let totalCarbonCredits = 0;
    let totalProductionKg = 0;
    let totalAreaHa = 0;

    const marketRate = Number(marketRateOverride || 120);

    ponds.forEach((pond, index) => {
      const res = this.calculateOnFrontend(pond);
      const creditsYear = Number(res?.summary?.creditsPerYear || res?.summary?.creditsPerCrop || 0);
      const co2Reduction = Number(res?.summary?.creditsPerCrop || 0);
      const productionKg = Number(res?.farmSummary?.totalBiomassHarvestedKg || 0);
      const areaHa = Number(res?.farmSummary?.pondAreaHa || pond.area || pond.pondAreaHa || 1.0);
      const pctReduction = Number(res?.summary?.percentReduction || 0);
      const creditsPerHaPerYear = Number(res?.summary?.creditsPerHaPerYear || (areaHa > 0 ? creditsYear / areaHa : 0));
      const speciesName = pond.selectedSpecies || pond.subCategory || pond.cultureType || 'IMC';
      const cultureType = pond.aquacultureType || pond.plantationType || 'Fish';
      const pondName = pond.name || `POND ${index + 1}`;

      totalCO2Reduction += co2Reduction;
      totalCarbonCredits += creditsYear;
      totalProductionKg += productionKg;
      totalAreaHa += areaHa;

      pondResults.push({
        pondIndex: index + 1,
        pondName,
        cultureType,
        species: speciesName,
        pondArea: areaHa,
        pondAreaUnit: pond.unit || 'Hectare',
        totalProduction: productionKg,
        co2Reduction,
        percentReduction: pctReduction,
        potentialCarbonCredits: creditsYear,
        creditsPerHaPerYear,
        fullResults: res
      });
    });

    const portfolioValue = totalCarbonCredits * marketRate;

    return {
      pondResults,
      overallSummary: {
        totalCO2Reduction,
        totalCarbonCredits,
        totalProductionKg,
        totalAreaHa,
        currentMarketRate: marketRate,
        portfolioValue
      }
    };
  }

  downloadPdf(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download-pdf`, { responseType: 'blob' });
  }

  /**
   * Verra VCS (VM0047 ARR v1.1 & VM0033 Blue Carbon v2.1) Trees & Mangroves Calculator
   */
  calculateTreeMangroveCarbon(input: {
    landType?: string;
    smallTreeCount?: number;
    mediumTreeCount?: number;
    largeTreeCount?: number;
    mangroveAreaHa?: number;
    biomassFactor?: number;
    creditRateInr?: number;
  }) {
    const landType = input.landType || 'Open Land';
    const smallTreeCount = Math.max(0, Number(input.smallTreeCount || 0));
    const mediumTreeCount = Math.max(0, Number(input.mediumTreeCount || 0));
    const largeTreeCount = Math.max(0, Number(input.largeTreeCount || 0));
    const mangroveAreaHa = Math.max(0, Number(input.mangroveAreaHa || 0));
    const biomassFactor = Math.max(0.1, Number(input.biomassFactor || 1.0));
    const creditRateInr = Math.max(1, Number(input.creditRateInr || 120));

    // Universal Constants
    const a = -2.134;
    const b = 2.530;
    const R_tree = 0.24;
    const R_mangrove = 0.39;
    const CF = 0.47;
    const RATIO = 44 / 12; // 3.66667

    // Single Tree AGB (kg)
    const smallAgbKg = Math.exp(a + (b * Math.log(10.0))) * biomassFactor; // 40.107 kg
    const mediumAgbKg = Math.exp(a + (b * Math.log(25.0))) * biomassFactor; // 407.419 kg
    const largeAgbKg = Math.exp(a + (b * Math.log(45.0))) * biomassFactor; // 1802.404 kg

    // Single Tree CO2e (tonnes)
    const smallPerTreeTonnes = (smallAgbKg / 1000.0) * (1.0 + R_tree) * CF * RATIO;   // 0.0857 t
    const mediumPerTreeTonnes = (mediumAgbKg / 1000.0) * (1.0 + R_tree) * CF * RATIO; // 0.8710 t
    const largePerTreeTonnes = (largeAgbKg / 1000.0) * (1.0 + R_tree) * CF * RATIO;   // 3.8535 t

    // Totals by tree category
    const smallTreeCO2e = smallTreeCount * smallPerTreeTonnes;
    const mediumTreeCO2e = mediumTreeCount * mediumPerTreeTonnes;
    const largeTreeCO2e = largeTreeCount * largePerTreeTonnes;
    const totalTreesCount = smallTreeCount + mediumTreeCount + largeTreeCount;
    const totalTreesCO2e = smallTreeCO2e + mediumTreeCO2e + largeTreeCO2e;

    // Mangroves (Biomass + Soil)
    const mangroveBiomassCarbonTonnes = mangroveAreaHa * 150.0 * (1.0 + R_mangrove) * CF;
    const mangroveSoilCarbonTonnes = mangroveAreaHa * 386.0;
    const mangroveTotalCarbonTonnes = mangroveBiomassCarbonTonnes + mangroveSoilCarbonTonnes;
    const totalMangroveCO2e = mangroveTotalCarbonTonnes * RATIO;

    // Combined Totals
    const totalCO2eStored = totalTreesCO2e + totalMangroveCO2e;
    const totalCarbonCredits = totalCO2eStored;
    const portfolioValueInr = totalCarbonCredits * creditRateInr;

    return {
      landType,
      biomassFactor,
      treeInventory: {
        small: {
          count: smallTreeCount,
          dbhCm: 10,
          agbPerTreeKg: parseFloat(smallAgbKg.toFixed(1)),
          co2ePerTreeTonnes: parseFloat(smallPerTreeTonnes.toFixed(4)),
          totalCO2eTonnes: parseFloat(smallTreeCO2e.toFixed(2))
        },
        medium: {
          count: mediumTreeCount,
          dbhCm: 25,
          agbPerTreeKg: parseFloat(mediumAgbKg.toFixed(1)),
          co2ePerTreeTonnes: parseFloat(mediumPerTreeTonnes.toFixed(4)),
          totalCO2eTonnes: parseFloat(mediumTreeCO2e.toFixed(2))
        },
        large: {
          count: largeTreeCount,
          dbhCm: 45,
          agbPerTreeKg: parseFloat(largeAgbKg.toFixed(1)),
          co2ePerTreeTonnes: parseFloat(largePerTreeTonnes.toFixed(4)),
          totalCO2eTonnes: parseFloat(largeTreeCO2e.toFixed(2)),
          totalCarbonTonnes: parseFloat((largeTreeCO2e / RATIO).toFixed(2))
        },
        totalCount: totalTreesCount,
        totalCO2eTonnes: parseFloat(totalTreesCO2e.toFixed(2))
      },
      mangroveDetails: {
        areaHa: mangroveAreaHa,
        biomassCarbonTonnes: parseFloat(mangroveBiomassCarbonTonnes.toFixed(2)),
        soilCarbonTonnes: parseFloat(mangroveSoilCarbonTonnes.toFixed(2)),
        totalCarbonTonnes: parseFloat(mangroveTotalCarbonTonnes.toFixed(2)),
        totalCO2eTonnes: parseFloat(totalMangroveCO2e.toFixed(2)),
        co2ePerHaTonnes: parseFloat((totalMangroveCO2e / (mangroveAreaHa || 1)).toFixed(2))
      },
      summary: {
        totalCO2eStoredTonnes: parseFloat(totalCO2eStored.toFixed(2)),
        totalCarbonCredits: parseFloat(totalCarbonCredits.toFixed(2)),
        creditRateInr,
        portfolioValueInr: Math.round(portfolioValueInr)
      }
    };
  }
}
