import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CarbonCalculatorInputs {
  pondArea?: number;
  cropDuration?: number;
  cropsPerYear?: number;
  netBiomassGain?: number;
  feedProtein?: number;
  feedCarbon?: number;
  dobProportion?: number;
  dobEF?: number;
  gncEF?: number;
  nitrogenRetention?: number;
  carbonRetention?: number;
  n2oEF?: number;
  gwpCH4?: number;
  gwpN2O?: number;
  dieselEF?: number;
  dieselBaseline?: number;
  dieselImproved?: number;
  anaerobicBaseline?: number;
  anaerobicImproved?: number;
  fcrBaseline?: number;
  fcrImprovement?: number;
  measuredCH4Baseline?: number | null;
  measuredCH4Improved?: number | null;
  measuredN2OBaseline?: number | null;
  measuredN2OImproved?: number | null;
}

export interface ScenarioResult {
  feedRequired: number;
  dobQuantity: number;
  gncQuantity: number;
  feedScope3: number;
  feedNInput: number;
  nRetained: number;
  n2oEmission: number;
  n2oCO2e: number;
  feedCInput: number;
  cRetained: number;
  cNotRetained: number;
  ch4CProduced: number;
  ch4Emission: number;
  ch4CO2e: number;
  dieselCO2e: number;
  totalFootprint: number;
}

export interface CalculatorResults {
  inputs: any;
  baseline: any;
  improved: any;
  summary: {
    creditsPerCrop: number;
    percentReduction: number;
    creditsPerYear: number;
    creditsPerHaPerYear: number;
  };
}

export interface SpeciesConfig {
  cultureType: string;
  speciesName: string;
  stockingDensity: number;
  stockingWeightG: number;
  finalHarvestWeightG: number;
  cultureDurationDays: number;
  survivalFraction: number;
  fcrBaseline: number;
  feedProtein: number;
  feedCarbon: number;
  feedMfgEF: number;
  nitrogenRetention: number;
  carbonRetention: number;
  anaerobicBaseline: number;
  n2oEF: number;
  gridElectricityKwh: number;
  dieselL: number;
  seedPrice: number;
  feedPrice: number;
  salePrice: number;
  labourCost: number;
  probioticsCost: number;
  otherCosts: number;
}

export const SPECIES_DEFAULTS: Record<string, SpeciesConfig> = {
  "IMC": {
    cultureType: "IMC",
    speciesName: "IMC (Indian Major Carp - Polyculture)",
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
    gridElectricityKwh: 0,
    dieselL: 1500,
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
    gridElectricityKwh: 4500,
    dieselL: 800,
    seedPrice: 1.5,
    feedPrice: 48,
    salePrice: 110,
    labourCost: 75000,
    probioticsCost: 30000,
    otherCosts: 25000
  },
  "Red Pacu": {
    cultureType: "Red Pacu",
    speciesName: "Red Pacu (Rupchanda)",
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
  "Roopchand": {
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
  "Rupchanda": {
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
  "Tilapia": {
    cultureType: "Tilapia",
    speciesName: "Tilapia (Nile / GIFT)",
    stockingDensity: 25000,
    stockingWeightG: 5,
    finalHarvestWeightG: 600,
    cultureDurationDays: 180,
    survivalFraction: 0.88,
    fcrBaseline: 1.6,
    feedProtein: 0.28,
    feedCarbon: 0.40,
    feedMfgEF: 0.5500,
    nitrogenRetention: 0.25,
    carbonRetention: 0.22,
    anaerobicBaseline: 0.20,
    n2oEF: 0.0071,
    gridElectricityKwh: 4000,
    dieselL: 600,
    seedPrice: 1.2,
    feedPrice: 50,
    salePrice: 135,
    labourCost: 55000,
    probioticsCost: 20000,
    otherCosts: 18000
  },
  "P. vannamei": {
    cultureType: "P. vannamei",
    speciesName: "P. vannamei (Pacific White Shrimp)",
    stockingDensity: 400000,
    stockingWeightG: 0.005,
    finalHarvestWeightG: 20,
    cultureDurationDays: 100,
    survivalFraction: 0.75,
    fcrBaseline: 1.4,
    feedProtein: 0.35,
    feedCarbon: 0.45,
    feedMfgEF: 0.8500,
    nitrogenRetention: 0.25,
    carbonRetention: 0.22,
    anaerobicBaseline: 0.15,
    n2oEF: 0.0071,
    gridElectricityKwh: 12000,
    dieselL: 1200,
    seedPrice: 0.4,
    feedPrice: 85,
    salePrice: 380,
    labourCost: 120000,
    probioticsCost: 65000,
    otherCosts: 45000
  },
  "P. monodon": {
    cultureType: "P. monodon",
    speciesName: "P. monodon (Giant Tiger Prawn)",
    stockingDensity: 150000,
    stockingWeightG: 0.005,
    finalHarvestWeightG: 30,
    cultureDurationDays: 120,
    survivalFraction: 0.70,
    fcrBaseline: 1.6,
    feedProtein: 0.38,
    feedCarbon: 0.46,
    feedMfgEF: 0.9000,
    nitrogenRetention: 0.25,
    carbonRetention: 0.22,
    anaerobicBaseline: 0.18,
    n2oEF: 0.0071,
    gridElectricityKwh: 10000,
    dieselL: 1400,
    seedPrice: 0.6,
    feedPrice: 88,
    salePrice: 520,
    labourCost: 110000,
    probioticsCost: 60000,
    otherCosts: 40000
  }
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
    const culture_type = input.cultureType || input.selectedSpecies || 'IMC';
    const species = SPECIES_DEFAULTS[culture_type] || SPECIES_DEFAULTS['IMC'];

    const stocking_density = Number(input.stockingDensity ?? species.stockingDensity ?? 6250);
    const stocking_weight_g = Number(input.stockingWeightG ?? species.stockingWeightG ?? 150);
    const final_harvest_weight_g = Number(input.finalHarvestWeightG ?? species.finalHarvestWeightG ?? 1500);
    const culture_duration_days = Number(input.cultureDurationDays ?? species.cultureDurationDays ?? 240);
    const survival_fraction = Number(input.survivalFraction ?? species.survivalFraction ?? 0.80);

    const feed_protein_pct = Number(input.feedProtein ?? species.feedProtein ?? 0.28);
    const feed_carbon_pct = Number(input.feedCarbon ?? species.feedCarbon ?? 0.40);
    const feed_nitrogen_pct = feed_protein_pct / 6.25;
    const feed_mfg_ef = Number(input.feedMfgEF ?? species.feedMfgEF ?? 0.4727);

    const pond_area_ha = Number(input.pondArea ?? input.pondAreaHa ?? 1.0);
    const crops_per_year = Number(input.cropsPerYear ?? 1.5);
    const gwp_framework = input.gwpFramework || 'AR5';
    const farm_reported_fcr = input.farmReportedFcr ?? input.averageFcr ?? species.fcrBaseline;

    const actual_fcr_used = (farm_reported_fcr !== null && farm_reported_fcr !== undefined && !isNaN(farm_reported_fcr) && Number(farm_reported_fcr) > 0)
      ? Number(farm_reported_fcr)
      : (species.fcrBaseline || 3.0);

    const gwp_ch4 = (gwp_framework === 'AR6') ? 27.0 : Number(input.gwpCH4 ?? 28.0);
    const gwp_n2o = (gwp_framework === 'AR6') ? 273.0 : Number(input.gwpN2O ?? 265.0);

    const growth_curve_type = input.growthCurveType || 'Exponential';
    const mortality_feed_factor = Number(input.mortalityFeedFactor ?? 0.5);

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

    const total_feed_required_kg = Number(input.total_feed_required_kg ?? input.totalFeedRequiredKg ?? input.qtyFeedConsumed ?? input.feedConsumed ?? cumulative_feed_kg);
    const standing_biomass_end_kg = period_biomass_kg;

    let total_production_kg = standing_biomass_end_kg;

    // Feed emissions
    const carbon_retention_efficiency = Number(input.carbonRetention ?? 0.22);
    const nitrogen_retention_efficiency = Number(input.nitrogenRetention ?? 0.25);

    const feed_scope3_co2e_t = (total_feed_required_kg * feed_mfg_ef) / 1000;
    const feed_carbon_in_kg = total_feed_required_kg * feed_carbon_pct;
    const carbon_retained_kg = feed_carbon_in_kg * carbon_retention_efficiency;
    const carbon_lost_kg = feed_carbon_in_kg - carbon_retained_kg;

    const feed_nitrogen_in_kg = total_feed_required_kg * feed_nitrogen_pct;
    const nitrogen_retained_kg = feed_nitrogen_in_kg * nitrogen_retention_efficiency;
    const nitrogen_lost_kg = feed_nitrogen_in_kg - nitrogen_retained_kg;

    // Pond emissions
    const anaerobic_fraction = Number(input.anaerobicBaseline ?? input.anaerobicFraction ?? 0.20);
    const anaerobic_adjustment_factor = Number(input.anaerobicAdjustmentFactor ?? 1.0);
    const sediment_burial_fraction = Number(input.sedimentBurialFraction ?? 0.20);
    const ch4_oxidation_fraction = Number(input.ch4OxidationFraction ?? 0.25);

    const n2o_n_ef = Number(input.n2oEF ?? 0.0071);

    const ch4_c_produced_kg = carbon_lost_kg * (1 - sediment_burial_fraction) * anaerobic_fraction * anaerobic_adjustment_factor;
    const ch4_gross_kg = ch4_c_produced_kg * (16 / 12);
    const ch4_modelled_kg = ch4_gross_kg * (1 - ch4_oxidation_fraction);
    const ch4_used_kg = Number(input.measuredCH4Baseline ?? ch4_modelled_kg);
    const ch4_co2e_t = (ch4_used_kg * gwp_ch4) / 1000;

    const n2o_modelled_kg = nitrogen_lost_kg * n2o_n_ef * (44 / 28);
    const n2o_used_kg = Number(input.measuredN2OBaseline ?? n2o_modelled_kg);
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

    // Energy
    const paddlewheel_hp = Number(input.paddlewheelHp ?? 2);
    const paddlewheel_units = Number(input.paddlewheelUnits ?? 4);
    const paddlewheel_hours = Number(input.paddlewheelHours ?? 8);
    const paddlewheel_kwh = paddlewheel_hp * 0.746 * paddlewheel_units * paddlewheel_hours;

    const blower_kw = Number(input.blowerKw ?? 0);
    const blower_hours = Number(input.blowerHours ?? 0);
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

    // Interventions (Module 9)
    const interventions = input.interventions || {};
    let fcrMultiplier = 1.0;
    let anaerobicMultiplier = 1.0;
    let n2oMultiplier = 1.0;
    let feedEfMultiplier = 1.0;
    let energyMultiplier = 1.0;

    if (interventions.betterFeed) { fcrMultiplier *= 0.95; feedEfMultiplier *= 0.95; }
    if (interventions.waterProbiotics) { fcrMultiplier *= 0.95; anaerobicMultiplier *= 0.80; }
    if (interventions.soilProbiotics) { fcrMultiplier *= 0.95; anaerobicMultiplier *= 0.80; }
    if (interventions.betterAeration) { fcrMultiplier *= 0.95; anaerobicMultiplier *= 0.70; energyMultiplier *= 1.10; }
    if (interventions.waterQualityMgmt) { fcrMultiplier *= 0.95; n2oMultiplier *= 0.80; }
    if (interventions.optimizedFeeding) { fcrMultiplier *= 0.95; }
    if (interventions.cnRatioMgmt) { anaerobicMultiplier *= 0.80; n2oMultiplier *= 0.85; }

    const combined_fcr_improvement = 1 - fcrMultiplier;
    const combined_anaerobic_reduction = 1 - anaerobicMultiplier;
    const combined_n2o_reduction = 1 - n2oMultiplier;

    const feed_ef_reduction = interventions.betterFeed ? 0.05 : 0;
    const energy_co2e_increase = interventions.betterAeration ? 0.10 : 0;

    const fcr_imp_factor = Number(input.fcr_improvement ?? input.fcrImprovement ?? 0.10);
    const final_fcr_improvement = Math.max(combined_fcr_improvement, fcr_imp_factor);

    const improved_fcr = actual_fcr_used * (1 - final_fcr_improvement);
    const improved_feed_kg = total_feed_required_kg * (improved_fcr / actual_fcr_used);
    const improved_feed_ef = feed_mfg_ef * (1 - feed_ef_reduction);
    const improved_feed_co2e_t = (improved_feed_kg * improved_feed_ef) / 1000;

    const improved_carbon_lost_kg = improved_feed_kg * feed_carbon_pct * (1 - carbon_retention_efficiency);
    const improved_anaerobic_fraction = Number(input.improved_anaerobic_fraction ?? input.improvedAnaerobicFraction ?? (anaerobic_fraction * (1 - combined_anaerobic_reduction) * anaerobic_adjustment_factor));
    const improved_ch4_kg = improved_carbon_lost_kg * (1 - sediment_burial_fraction) * improved_anaerobic_fraction * (16 / 12) * (1 - ch4_oxidation_fraction);
    const improved_ch4_co2e_t = (improved_ch4_kg * gwp_ch4) / 1000;

    const improved_nitrogen_lost_kg = improved_feed_kg * feed_nitrogen_pct * (1 - nitrogen_retention_efficiency);
    const improved_n2o_n_ef = n2o_n_ef * (1 - combined_n2o_reduction);
    const improved_n2o_kg = improved_nitrogen_lost_kg * improved_n2o_n_ef * (44 / 28);
    const improved_n2o_co2e_t = (improved_n2o_kg * gwp_n2o) / 1000;

    const improved_energy_co2e_t = total_energy_co2e_t * (1 + energy_co2e_increase);

    // Module 10: Accounting & Credits
    const gross_emission_baseline_t = feed_scope3_co2e_t + total_energy_co2e_t + ch4_co2e_t + n2o_co2e_t + lime_fertilizer_co2e_t + idle_phase_co2e_t;
    const gross_emission_improved_t = improved_feed_co2e_t + improved_energy_co2e_t + improved_ch4_co2e_t + improved_n2o_co2e_t + lime_fertilizer_co2e_t + idle_phase_co2e_t;

    const biomass_carbon_pct = Number(input.biomassCarbonPct ?? 0.08);
    const carbon_stored_biomass_t = (total_production_kg * biomass_carbon_pct * (44 / 12)) / 1000;

    const net_emission_baseline_t = Math.max(0, gross_emission_baseline_t - carbon_stored_biomass_t);
    const net_emission_improved_t = Math.max(0, gross_emission_improved_t - carbon_stored_biomass_t);

    const emission_intensity_baseline = total_production_kg > 0 ? (net_emission_baseline_t * 1000) / total_production_kg : 0;
    const co2e_reduction_per_crop_t = Math.max(0, net_emission_baseline_t - net_emission_improved_t);
    const pct_reduction = net_emission_baseline_t > 0 ? (co2e_reduction_per_crop_t / net_emission_baseline_t) * 100 : 0;
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
        electricityCO2e: electricity_co2e_t * energyMultiplier,
        dieselCO2e: diesel_co2e_t * energyMultiplier,
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
        emissionIntensityBaseline: emission_intensity_baseline
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
      }
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
    const mangroveBiomassCarbonTonnes = mangroveAreaHa * 150.0 * (1.0 + R_mangrove) * CF; // Area * 97.995 t C
    const mangroveSoilCarbonTonnes = mangroveAreaHa * 386.0; // Area * 386 t C
    const mangroveTotalCarbonTonnes = mangroveBiomassCarbonTonnes + mangroveSoilCarbonTonnes; // Area * 483.995 t C
    const totalMangroveCO2e = mangroveTotalCarbonTonnes * RATIO; // Area * 1774.648 tCO2e

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
          co2ePerTreeTonnes: parseFloat(smallPerTreeTonnes.toFixed(3)), // 0.086
          totalCarbonTonnes: parseFloat(((smallAgbKg / 1000.0) * (1.0 + R_tree) * CF * smallTreeCount).toFixed(2)),
          totalCO2eTonnes: parseFloat(smallTreeCO2e.toFixed(2))
        },
        medium: {
          count: mediumTreeCount,
          dbhCm: 25,
          agbPerTreeKg: parseFloat(mediumAgbKg.toFixed(1)),
          co2ePerTreeTonnes: parseFloat(mediumPerTreeTonnes.toFixed(3)), // 0.871
          totalCarbonTonnes: parseFloat(((mediumAgbKg / 1000.0) * (1.0 + R_tree) * CF * mediumTreeCount).toFixed(2)),
          totalCO2eTonnes: parseFloat(mediumTreeCO2e.toFixed(2))
        },
        large: {
          count: largeTreeCount,
          dbhCm: 45,
          agbPerTreeKg: parseFloat(largeAgbKg.toFixed(1)),
          co2ePerTreeTonnes: parseFloat(largePerTreeTonnes.toFixed(3)), // 3.852
          totalCarbonTonnes: parseFloat(((largeAgbKg / 1000.0) * (1.0 + R_tree) * CF * largeTreeCount).toFixed(2)),
          totalCO2eTonnes: parseFloat(largeTreeCO2e.toFixed(2))
        },
        totalCount: totalTreesCount,
        totalCO2eTonnes: parseFloat(totalTreesCO2e.toFixed(2))
      },
      mangroveDetails: {
        areaHa: mangroveAreaHa,
        biomassCarbonTonnes: parseFloat(mangroveBiomassCarbonTonnes.toFixed(2)),
        soilCarbonTonnes: parseFloat(mangroveSoilCarbonTonnes.toFixed(2)),
        totalCarbonTonnes: parseFloat(mangroveTotalCarbonTonnes.toFixed(2)),
        co2ePerHaTonnes: parseFloat((483.995 * RATIO).toFixed(1)), // ~1774.6
        totalCO2eTonnes: parseFloat(totalMangroveCO2e.toFixed(2))
      },
      summary: {
        totalTreesCO2eTonnes: parseFloat(totalTreesCO2e.toFixed(2)),
        totalMangroveCO2eTonnes: parseFloat(totalMangroveCO2e.toFixed(2)),
        totalCO2eStoredTonnes: parseFloat(totalCO2eStored.toFixed(2)),
        totalCarbonCredits: parseFloat(totalCarbonCredits.toFixed(2)),
        creditRateInr,
        portfolioValueInr: Math.round(portfolioValueInr)
      }
    };
  }
}
