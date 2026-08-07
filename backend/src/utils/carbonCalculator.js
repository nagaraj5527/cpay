import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Species Defaults Database from Indian_Aquaculture_GHG_Carbon_Tool_v3.3.xlsx
export const SPECIES_DATABASE = {
  "IMC": {
    cultureType: "IMC",
    speciesName: "IMC (Indian Major Carp - Polyculture)",
    stockingDensity: 6250, // per ha
    stockingWeightG: 150, // g
    finalHarvestWeightG: 1500, // g
    cultureDurationDays: 240, // days
    survivalFraction: 0.80, // 80%
    fcrBaseline: 3.0,
    feedProtein: 0.2433, // 24.33%
    feedCarbon: 0.3925, // 39.25%
    feedMfgEF: 0.615, // kgCO2e/kg
    nitrogenRetention: 0.25, // 25%
    carbonRetention: 0.22, // 22%
    anaerobicBaseline: 0.20, // 20%
    n2oEF: 0.008, // 0.8%
    gridElectricityKwh: 0,
    dieselL: 1500,
    seedPrice: 3.5, // Rs/piece
    feedPrice: 45, // Rs/kg
    salePrice: 130, // Rs/kg
    labourCost: 60000,
    probioticsCost: 25000,
    otherCosts: 20000
  },
  "Pangasius": {
    cultureType: "Pangasius",
    speciesName: "Pangasius (Striped Catfish)",
    stockingDensity: 40000,
    stockingWeightG: 5,
    finalHarvestWeightG: 1200,
    cultureDurationDays: 210,
    survivalFraction: 0.85,
    fcrBaseline: 1.8,
    feedProtein: 0.276,
    feedCarbon: 0.395,
    feedMfgEF: 1.81,
    nitrogenRetention: 0.25,
    carbonRetention: 0.22,
    anaerobicBaseline: 0.25,
    n2oEF: 0.008,
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
    stockingDensity: 15000,
    stockingWeightG: 10,
    finalHarvestWeightG: 1000,
    cultureDurationDays: 210,
    survivalFraction: 0.85,
    fcrBaseline: 1.9,
    feedProtein: 0.282,
    feedCarbon: 0.395,
    feedMfgEF: 1.81,
    nitrogenRetention: 0.25,
    carbonRetention: 0.22,
    anaerobicBaseline: 0.22,
    n2oEF: 0.008,
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
    feedProtein: 0.280,
    feedCarbon: 0.395,
    feedMfgEF: 1.70,
    nitrogenRetention: 0.26,
    carbonRetention: 0.23,
    anaerobicBaseline: 0.20,
    n2oEF: 0.008,
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
    stockingDensity: 300000,
    stockingWeightG: 0.01,
    finalHarvestWeightG: 22.2,
    cultureDurationDays: 120,
    survivalFraction: 0.75,
    fcrBaseline: 1.4,
    feedProtein: 0.346,
    feedCarbon: 0.391,
    feedMfgEF: 2.46,
    nitrogenRetention: 0.28,
    carbonRetention: 0.25,
    anaerobicBaseline: 0.15,
    n2oEF: 0.006,
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
    stockingWeightG: 0.01,
    finalHarvestWeightG: 33.3,
    cultureDurationDays: 150,
    survivalFraction: 0.70,
    fcrBaseline: 1.7,
    feedProtein: 0.343,
    feedCarbon: 0.3915,
    feedMfgEF: 2.43,
    nitrogenRetention: 0.27,
    carbonRetention: 0.24,
    anaerobicBaseline: 0.18,
    n2oEF: 0.006,
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

let cachedExcelDefaults = null;

export function getDefaultInputsFromExcel(cultureType = 'IMC') {
  const speciesConfig = SPECIES_DATABASE[cultureType] || SPECIES_DATABASE['IMC'];
  return { ...speciesConfig };
}

/**
 * Full 10-Module Calculation Engine as specified in Calculation_Engine_Specification.docx
 */
export function calculateCarbonCredits(userInputs = {}) {
  const selectedSpecies = userInputs.cultureType || 'IMC';
  const defaults = getDefaultInputsFromExcel(selectedSpecies);

  // Merge user inputs with species defaults
  const p = { ...defaults, ...userInputs };

  // 1. Operational & Setup Values
  const pondAreaHa = Number(p.pondArea) || Number(p.pondAreaHa) || 1.0;
  const cropsPerYear = Number(p.cropsPerYear) || 1.5;
  const stockingDensity = Number(p.stockingDensity) || 6250;
  const totalStockedNumber = stockingDensity * pondAreaHa;
  const survivalFraction = Number(p.survivalFraction) || 0.80;
  const totalHarvestedNumber = totalStockedNumber * survivalFraction;
  
  const finalHarvestWeightG = Number(p.finalHarvestWeightG) || 1500;
  const totalBiomassHarvestedKg = (totalHarvestedNumber * finalHarvestWeightG) / 1000;
  const netBiomassGainTonnes = totalBiomassHarvestedKg / 1000;

  // 2. FCR and Feed Required
  const actualFcrUsed = Number(p.farmReportedFcr) || Number(p.fcrBaseline) || 3.0;
  const totalFeedRequiredKg = totalBiomassHarvestedKg * actualFcrUsed;
  const totalFeedRequiredTonnes = totalFeedRequiredKg / 1000;

  // 3. Feed Profile & Emissions (Module 5)
  const feedProteinPct = Number(p.feedProtein) || 0.2433;
  const feedCarbonPct = Number(p.feedCarbon) || 0.3925;
  const feedMfgEf = Number(p.feedMfgEF) || 0.615; // kgCO2e/kg
  const feedScope3BaselineCO2e = (totalFeedRequiredKg * feedMfgEf) / 1000; // tCO2e

  // 4. Nitrogen & Nitrous Oxide N2O Emissions (Module 6)
  const nitrogenRetentionPct = Number(p.nitrogenRetention) || 0.25;
  const n2oN_EF = Number(p.n2oEF) || 0.008; // 0.8% of N lost
  const gwpN2O = p.gwpFramework === 'AR6' ? 273 : 265;

  const feedNInputKg = (totalFeedRequiredKg * feedProteinPct) / 6.25;
  const nitrogenLostKg = feedNInputKg * (1 - nitrogenRetentionPct);
  
  let n2oEmissionKg = nitrogenLostKg * n2oN_EF * (44 / 28);
  if (p.measuredN2OBaseline) {
    n2oEmissionKg = Number(p.measuredN2OBaseline);
  }
  const n2oCO2eBaseline = (n2oEmissionKg * gwpN2O) / 1000; // tCO2e

  // 5. Carbon & Benthic Methane CH4 Emissions (Module 6)
  const carbonRetentionPct = Number(p.carbonRetention) || 0.22;
  const anaerobicBaselinePct = Number(p.anaerobicBaseline) || 0.20;
  const gwpCH4 = p.gwpFramework === 'AR6' ? 27 : 28;

  const feedCInputKg = totalFeedRequiredKg * feedCarbonPct;
  const carbonLostKg = feedCInputKg * (1 - carbonRetentionPct);
  const ch4CProducedKg = carbonLostKg * anaerobicBaselinePct;
  
  let ch4EmissionKg = ch4CProducedKg * (16 / 12) * (1 - 0.25); // 25% oxidation factor
  if (p.measuredCH4Baseline) {
    ch4EmissionKg = Number(p.measuredCH4Baseline);
  }
  const ch4CO2eBaseline = (ch4EmissionKg * gwpCH4) / 1000; // tCO2e

  // 6. Energy & Diesel Scope 1 & 2 Emissions (Module 7)
  const gridElectricityKwh = Number(p.gridElectricityKwh) || 0;
  const gridEf = Number(p.gridEf) || 0.710; // kgCO2e/kWh (CEA India FY25)
  const electricityCO2eBaseline = (gridElectricityKwh * gridEf) / 1000;

  const dieselL = Number(p.dieselL) || Number(p.dieselBaseline) || 1500;
  const dieselEf = Number(p.dieselEf) || 3.0; // kgCO2e/L
  const dieselCO2eBaseline = (dieselL * dieselEf) / 1000;

  const totalEnergyCO2eBaseline = electricityCO2eBaseline + dieselCO2eBaseline;

  // Total Baseline Footprint (Module 10)
  const grossFootprintBaseline = feedScope3BaselineCO2e + n2oCO2eBaseline + ch4CO2eBaseline + totalEnergyCO2eBaseline;

  // 7. Improved Farming Interventions (Module 9)
  const interventions = p.interventions || {};
  
  let fcrMultiplier = 1.0;
  let anaerobicMultiplier = 1.0;
  let n2oMultiplier = 1.0;
  let feedEfMultiplier = 1.0;
  let energyMultiplier = 1.0;

  if (interventions.betterFeed) { fcrMultiplier *= (1 - 0.05); feedEfMultiplier *= (1 - 0.05); }
  if (interventions.waterProbiotics) { fcrMultiplier *= (1 - 0.05); anaerobicMultiplier *= (1 - 0.20); }
  if (interventions.soilProbiotics) { fcrMultiplier *= (1 - 0.05); anaerobicMultiplier *= (1 - 0.20); }
  if (interventions.betterAeration) { fcrMultiplier *= (1 - 0.05); anaerobicMultiplier *= (1 - 0.30); energyMultiplier *= (1 + 0.10); }
  if (interventions.waterQualityMgmt) { fcrMultiplier *= (1 - 0.05); n2oMultiplier *= (1 - 0.20); }
  if (interventions.optimizedFeeding) { fcrMultiplier *= (1 - 0.05); }
  if (interventions.cnRatioMgmt) { anaerobicMultiplier *= (1 - 0.20); n2oMultiplier *= (1 - 0.15); }

  const combinedFcrImprovement = 1 - fcrMultiplier;
  const combinedAnaerobicReduction = 1 - anaerobicMultiplier;
  const combinedN2OReduction = 1 - n2oMultiplier;

  // Improved Scenario Calculations
  const improvedFcr = actualFcrUsed * (1 - combinedFcrImprovement);
  const improvedFeedKg = totalBiomassHarvestedKg * improvedFcr;
  const improvedFeedEf = feedMfgEf * feedEfMultiplier;
  const feedScope3ImprovedCO2e = (improvedFeedKg * improvedFeedEf) / 1000;

  const improvedFeedNInputKg = (improvedFeedKg * feedProteinPct) / 6.25;
  const improvedNitrogenLostKg = improvedFeedNInputKg * (1 - nitrogenRetentionPct);
  const improvedN2O_EF = n2oN_EF * (1 - combinedN2OReduction);
  const n2oEmissionImprovedKg = improvedNitrogenLostKg * improvedN2O_EF * (44 / 28);
  const n2oCO2eImproved = (n2oEmissionImprovedKg * gwpN2O) / 1000;

  const improvedFeedCInputKg = improvedFeedKg * feedCarbonPct;
  const improvedCarbonLostKg = improvedFeedCInputKg * (1 - carbonRetentionPct);
  const improvedAnaerobicFraction = anaerobicBaselinePct * (1 - combinedAnaerobicReduction);
  const ch4CProducedImprovedKg = improvedCarbonLostKg * improvedAnaerobicFraction;
  const ch4EmissionImprovedKg = ch4CProducedImprovedKg * (16 / 12) * (1 - 0.25);
  const ch4CO2eImproved = (ch4EmissionImprovedKg * gwpCH4) / 1000;

  const totalEnergyCO2eImproved = totalEnergyCO2eBaseline * energyMultiplier;

  // Total Improved Footprint
  const grossFootprintImproved = feedScope3ImprovedCO2e + n2oCO2eImproved + ch4CO2eImproved + totalEnergyCO2eImproved;

  // Carbon Credits & Reductions Summary (Module 10)
  const creditsPerCrop = Math.max(0, grossFootprintBaseline - grossFootprintImproved);
  const percentReduction = grossFootprintBaseline > 0 ? (creditsPerCrop / grossFootprintBaseline) * 100 : 0;
  const creditsPerYear = creditsPerCrop * cropsPerYear;
  const creditsPerHaPerYear = pondAreaHa > 0 ? creditsPerYear / pondAreaHa : 0;

  // 8. Economics Engine (Module 8)
  const feedPrice = Number(p.feedPrice) || 45;
  const seedPrice = Number(p.seedPrice) || 3.5;
  const salePrice = Number(p.salePrice) || 130;
  const electricityTariff = Number(p.electricityTariff) || 7.0;
  const dieselPrice = Number(p.dieselPrice) || 92.0;

  const labourCost = Number(p.labourCost) || 60000;
  const probioticsCost = Number(p.probioticsCost) || 25000;
  const otherCosts = Number(p.otherCosts) || 20000;

  const feedCostBaseline = totalFeedRequiredKg * feedPrice;
  const feedCostImproved = improvedFeedKg * feedPrice;
  
  const seedCost = totalStockedNumber * seedPrice;
  const electricityCost = gridElectricityKwh * electricityTariff;
  const dieselCost = dieselL * dieselPrice;

  const totalCostBaseline = feedCostBaseline + seedCost + electricityCost + dieselCost + labourCost + probioticsCost + otherCosts;
  const totalCostImproved = feedCostImproved + seedCost + (electricityCost * energyMultiplier) + dieselCost + labourCost + probioticsCost + otherCosts;

  const grossIncome = totalBiomassHarvestedKg * salePrice;
  const netProfitBaseline = grossIncome - totalCostBaseline;
  const netProfitImproved = grossIncome - totalCostImproved;
  const financialSavingsPerCrop = netProfitImproved - netProfitBaseline;

  const costPerKgBaseline = totalBiomassHarvestedKg > 0 ? totalCostBaseline / totalBiomassHarvestedKg : 0;
  const costPerKgImproved = totalBiomassHarvestedKg > 0 ? totalCostImproved / totalBiomassHarvestedKg : 0;

  return {
    inputs: {
      ...p,
      selectedSpecies,
      pondAreaHa,
      totalStockedNumber,
      totalBiomassHarvestedKg,
      netBiomassGainTonnes,
      actualFcrUsed,
      improvedFcr
    },
    baseline: {
      feedRequiredKg: totalFeedRequiredKg,
      feedScope3CO2e: feedScope3BaselineCO2e,
      ch4CO2e: ch4CO2eBaseline,
      n2oCO2e: n2oCO2eBaseline,
      energyCO2e: totalEnergyCO2eBaseline,
      totalFootprint: grossFootprintBaseline
    },
    improved: {
      feedRequiredKg: improvedFeedKg,
      feedScope3CO2e: feedScope3ImprovedCO2e,
      ch4CO2e: ch4CO2eImproved,
      n2oCO2e: n2oCO2eImproved,
      energyCO2e: totalEnergyCO2eImproved,
      totalFootprint: grossFootprintImproved
    },
    summary: {
      creditsPerCrop,
      percentReduction,
      creditsPerYear,
      creditsPerHaPerYear
    },
    economics: {
      feedCostBaseline,
      feedCostImproved,
      seedCost,
      electricityCost,
      dieselCost,
      totalCostBaseline,
      totalCostImproved,
      grossIncome,
      netProfitBaseline,
      netProfitImproved,
      financialSavingsPerCrop,
      costPerKgBaseline,
      costPerKgImproved
    }
  };
}

export function calculateDetailedAquacultureCarbon(params) {
  return calculateCarbonCredits(params);
}

export function calculateCarbonReport(category, quantity, age, carbonPrice = 120) {
  return calculateCarbonCredits({ quantity, age, carbonPrice });
}