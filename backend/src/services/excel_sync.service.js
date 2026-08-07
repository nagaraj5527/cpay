import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';
import { calculateAquacultureCarbon } from './aquaculture_calculator.service.js';

const TEMPLATE_EXCEL_PATH = path.resolve('src/documents/Indian_Aquaculture_GHG_Carbon_Tool_v3.3.xlsx');

/**
 * Synchronizes user aquaculture inputs with the backend Excel workbook template,
 * computes carbon credits via the calculation engine, and returns structured Report data.
 */
export function syncExcelWithInputs(userInputs = {}) {
  // Run calculation engine to get authoritative figures
  const calcResults = calculateAquacultureCarbon(userInputs);

  // Read workbook template if available
  let workbook = null;
  if (fs.existsSync(TEMPLATE_EXCEL_PATH)) {
    workbook = xlsx.readFile(TEMPLATE_EXCEL_PATH, { cellFormulas: true, cellStyles: true });
  }

  // Build structured Report sheet view combining user inputs & computed outputs
  const reportData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      cultureType: calcResults.culture_type,
      pondAreaHa: calcResults.pond_area_ha,
      cropsPerYear: calcResults.crops_per_year
    },
    kpiCards: {
      baselineFootprintTCO2e: Number(calcResults.net_emission_baseline_t.toFixed(2)),
      improvedFootprintTCO2e: Number(calcResults.net_emission_improved_t.toFixed(2)),
      co2eReductionPerCrop: Number(calcResults.co2e_reduction_per_crop_t.toFixed(2)),
      percentReduction: Number(calcResults.pct_reduction.toFixed(1)),
      carbonCreditPerYearTCO2e: Number(calcResults.carbon_credit_per_year_t.toFixed(2)),
      carbonCreditPerHaPerYearTCO2e: Number(calcResults.carbon_credit_per_ha_per_year_t.toFixed(2))
    },
    modulesSummary: [
      {
        module: 'Module 1 & 2: Species, Farm & Crop Inputs',
        details: [
          { label: 'Selected Culture Species', value: calcResults.culture_type },
          { label: 'Pond Area (ha)', value: calcResults.pond_area_ha },
          { label: 'Crops Per Year', value: calcResults.crops_per_year },
          { label: 'Stocking Density (per ha)', value: calcResults.stocking_density },
          { label: 'Stocking Weight (g)', value: calcResults.stocking_weight_g },
          { label: 'Harvest Weight (g)', value: calcResults.final_harvest_weight_g },
          { label: 'Culture Duration (days)', value: calcResults.culture_duration_days },
          { label: 'Actual FCR Used', value: calcResults.actual_fcr_used }
        ]
      },
      {
        module: 'Module 3 & 4: Growth & Harvest Engine',
        details: [
          { label: 'Total Feed Required (kg)', value: Number(calcResults.total_feed_required_kg.toFixed(1)) },
          { label: 'Improved Feed Required (kg)', value: Number(calcResults.improved_feed_kg.toFixed(1)) },
          { label: 'Total Fish/Prawn Production (kg)', value: Number(calcResults.total_production_kg.toFixed(1)) }
        ]
      },
      {
        module: 'Module 5 & 6: Feed & Pond Emissions',
        details: [
          { label: 'Feed Scope 3 CO2e (Baseline)', value: `${calcResults.feed_scope3_co2e_t.toFixed(2)} tCO2e` },
          { label: 'Feed Scope 3 CO2e (Improved)', value: `${calcResults.improved_feed_co2e_t.toFixed(2)} tCO2e` },
          { label: 'Pond CH4 Emissions (Baseline)', value: `${calcResults.ch4_co2e_t.toFixed(2)} tCO2e` },
          { label: 'Pond CH4 Emissions (Improved)', value: `${calcResults.improved_ch4_co2e_t.toFixed(2)} tCO2e` },
          { label: 'Pond N2O Emissions (Baseline)', value: `${calcResults.n2o_co2e_t.toFixed(2)} tCO2e` },
          { label: 'Pond N2O Emissions (Improved)', value: `${calcResults.improved_n2o_co2e_t.toFixed(2)} tCO2e` }
        ]
      },
      {
        module: 'Module 7: Energy Engine',
        details: [
          { label: 'Electricity CO2e', value: `${calcResults.electricity_co2e_t.toFixed(2)} tCO2e` },
          { label: 'Diesel Fuel CO2e', value: `${calcResults.diesel_co2e_t.toFixed(2)} tCO2e` },
          { label: 'Total Energy CO2e (Baseline)', value: `${calcResults.total_energy_co2e_t.toFixed(2)} tCO2e` }
        ]
      },
      {
        module: 'Module 8: Economics Engine',
        details: [
          { label: 'Total Cost per Crop (₹)', value: `₹${Math.round(calcResults.total_cost).toLocaleString('en-IN')}` },
          { label: 'Gross Income per Crop (₹)', value: `₹${Math.round(calcResults.gross_income).toLocaleString('en-IN')}` },
          { label: 'Net Profit per Crop (₹)', value: `₹${Math.round(calcResults.net_profit).toLocaleString('en-IN')}` },
          { label: 'Cost per kg Production (₹/kg)', value: `₹${calcResults.cost_per_kg.toFixed(2)}` }
        ]
      },
      {
        module: 'Module 9: Improved Farming Scenario',
        details: calcResults.measures.map(m => ({
          label: m.name,
          value: m.apply ? 'Applied (Active)' : 'Not Applied'
        }))
      },
      {
        module: 'Module 10: Carbon Accounting & Credits',
        details: [
          { label: 'Gross Baseline Emissions', value: `${calcResults.gross_emission_baseline_t.toFixed(2)} tCO2e` },
          { label: 'Gross Improved Emissions', value: `${calcResults.gross_emission_improved_t.toFixed(2)} tCO2e` },
          { label: 'Biomass Carbon Stored (Netting)', value: `${calcResults.carbon_stored_biomass_t.toFixed(2)} tCO2e` },
          { label: 'Net Baseline Emissions', value: `${calcResults.net_emission_baseline_t.toFixed(2)} tCO2e` },
          { label: 'Net Improved Emissions', value: `${calcResults.net_emission_improved_t.toFixed(2)} tCO2e` },
          { label: 'CO2e Reduction per Crop', value: `${calcResults.co2e_reduction_per_crop_t.toFixed(2)} tCO2e` },
          { label: 'Percentage GHG Reduction', value: `${calcResults.pct_reduction.toFixed(1)}%` },
          { label: 'Annual Carbon Credits Generated', value: `${calcResults.carbon_credit_per_year_t.toFixed(2)} tCO2e / year` },
          { label: 'Annual Credits Per Hectare', value: `${calcResults.carbon_credit_per_ha_per_year_t.toFixed(2)} tCO2e / ha / year` }
        ]
      }
    ],
    calcResults
  };

  return reportData;
}
