import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalculatorService, SPECIES_DEFAULTS } from '../../services/calculator.service';
import { RegistrationService } from '../../services/registration.service';

@Component({
  selector: 'app-carbon-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carbon-calculator.html',
  styleUrl: './carbon-calculator.css'
})
export class CarbonCalculatorComponent implements OnInit {
  selectedSpecies: string = 'IMC';

  // --- MODULE 1 & 2: FARM & STOCKING OPERATIONAL INPUTS (Inputs 1 to 14) ---
  stockingDensity: number = 6250;
  cultureDurationDays: number = 240;
  pondArea: number = 1.0;
  pondAreaUnit: string = 'Hectare';
  cropsPerYear: number = 1.5;
  netBiomassGainTonnes: number = 198;
  farmReportedFcr: number = 2.9;
  fcrImprovement: number = 0.10;
  stockingWeightG: number = 150;
  finalHarvestWeightG: number = 1500;
  survivalFraction: number = 0.80;
  growthCurveType: string = 'Exponential';
  mortalityFeedFactor: number = 0.5;
  gwpFramework: string = 'AR5';

  // --- MODULE 5 & 6: FEED PROFILE & POND DYNAMICS INPUTS (Inputs 15 to 28) ---
  feedProtein: number = 0.2433;
  feedCarbon: number = 0.3925;
  dobProportion: number = 0.9091;
  dobEF: number = 0.4;
  gncEF: number = 1.2;
  sbmEF: number = 1.1;
  ddgsEF: number = 0.9;
  feedMfgEF: number = 0.615;
  nitrogenRetention: number = 0.25;
  carbonRetention: number = 0.22;
  anaerobicBaseline: number = 0.20;
  anaerobicImproved: number = 0.08;
  n2oEF: number = 0.008;
  ch4OxidationFraction: number = 0.25;

  // --- MODULE 6 (OPTIONAL FIELD MEASURED OVERRIDES) (Inputs 29 to 32) ---
  measuredCH4Baseline: number | null = null;
  measuredCH4Improved: number | null = null;
  measuredN2OBaseline: number | null = null;
  measuredN2OImproved: number | null = null;

  // --- MODULE 7: ENERGY & FUEL OPERATIONAL INPUTS (Inputs 33 to 44) ---
  gridElectricityKwh: number = 0;
  gridEf: number = 0.710;
  paddlewheelHp: number = 2.0;
  paddlewheelUnits: number = 4;
  paddlewheelHours: number = 8;
  blowerKw: number = 3.0;
  blowerHours: number = 0;
  solarOffsetKwh: number = 0;
  dieselBaseline: number = 2000;
  dieselImproved: number = 1600;
  generatorDieselL: number = 0;
  dieselEf: number = 3.0;

  // --- MODULE 8: FARM ECONOMICS & PRICING INPUTS (Inputs 45 to 52) ---
  feedPrice: number = 45;
  seedPrice: number = 3.5;
  salePrice: number = 130;
  electricityTariff: number = 7.0;
  dieselPrice: number = 92;
  labourCost: number = 60000;
  probioticsCost: number = 25000;
  otherCosts: number = 20000;

  // --- MODULE 9: IMPROVED FARMING PRACTICE MEASURES (Inputs 53 to 59) ---
  interventions: Record<string, boolean> = {
    betterFeed: false,
    waterProbiotics: true,
    soilProbiotics: false,
    betterAeration: true,
    waterQualityMgmt: false,
    optimizedFeeding: false,
    cnRatioMgmt: false
  };

  // --- MODULE 10: PRODUCT CARBON & YIELD PARAMETERS (Input 60) ---
  biomassCarbonPct: number = 0.08;
  edibleYieldFraction: number = 0.65;

  // Unit Options for Pond Area Dropdown
  areaUnits: string[] = ['Hectare', 'Acre', 'Gunta', 'Cent', 'Bigha', 'Sq. Meters'];

  // Land & Tree/Mangrove Properties (Verra VM0047 / VM0033 for Open Land, Govt Land, House)
  selectedLandType: string = '';
  smallTreeCount: number = 300;
  mediumTreeCount: number = 120;
  largeTreeCount: number = 30;
  mangroveAreaHa: number = 0;
  biomassFactor: number = 1.00;
  treeMangroveResult: any = null;

  // Multi-Pond & Single Outputs
  results: any = null;
  ponds: any[] = [];
  pondResults: any[] = [];
  overallSummary: any = {
    totalCO2Reduction: 0,
    totalCarbonCredits: 0,
    totalProductionKg: 0,
    totalAreaHa: 0,
    currentMarketRate: 120,
    portfolioValue: 0
  };

  currentMarketRate: number = 120;

  isFlashing: boolean = false;
  showRecalcFloatingAlert: boolean = false;
  recalculateSuccessMessage: string = '';

  constructor(
    private router: Router,
    private calculatorService: CalculatorService,
    private registrationService: RegistrationService
  ) {
    const currentStep = 6;
    const storedFurthest = localStorage.getItem('SellerFurthestStep');
    const furthest = storedFurthest ? parseInt(storedFurthest, 10) : 1;
    if (currentStep > furthest) {
      localStorage.setItem('SellerFurthestStep', currentStep.toString());
    }
  }

  ngOnInit(): void {
    const currentMob = localStorage.getItem('currentUserMobile') || '';
    const savedLand = this.registrationService.getDraftData('SellerLandDetails', currentMob);
    if (savedLand) {
      try {
        if (savedLand.area && !isNaN(Number(savedLand.area))) this.pondArea = Number(savedLand.area);
        if (savedLand.unit) this.pondAreaUnit = savedLand.unit;
      } catch (e) {}
    }

    const savedPlantation = this.registrationService.getDraftData('SellerPlantationDetails', currentMob);
    if (savedPlantation) {
      try {
        const pd = savedPlantation;
        this.selectedLandType = pd.landType || '';
        if (pd.smallTreeCount !== undefined) this.smallTreeCount = Number(pd.smallTreeCount);
        if (pd.mediumTreeCount !== undefined) this.mediumTreeCount = Number(pd.mediumTreeCount);
        if (pd.largeTreeCount !== undefined) this.largeTreeCount = Number(pd.largeTreeCount);
        if (pd.mangroveAreaHa !== undefined) this.mangroveAreaHa = Number(pd.mangroveAreaHa);
        if (pd.biomassFactor !== undefined) this.biomassFactor = Number(pd.biomassFactor);

        if (pd.ponds && Array.isArray(pd.ponds) && pd.ponds.length > 0) {
          this.ponds = pd.ponds;
        }
        if (pd.subCategory) this.selectedSpecies = pd.subCategory;
        if (pd.area && !isNaN(Number(pd.area))) this.pondArea = Number(pd.area);
        if (pd.pondAreaHa && !isNaN(Number(pd.pondAreaHa))) this.pondArea = Number(pd.pondAreaHa);
        if (pd.unit) this.pondAreaUnit = pd.unit;
        if (pd.daysOfCulture) this.cultureDurationDays = Number(pd.daysOfCulture);
        if (pd.cultureDurationDays) this.cultureDurationDays = Number(pd.cultureDurationDays);
        if (pd.cropsPerYear) this.cropsPerYear = Number(pd.cropsPerYear);
        if (pd.stockingDensity) this.stockingDensity = Number(pd.stockingDensity);
        if (pd.feedPrice) this.feedPrice = Number(pd.feedPrice);
        if (pd.salePrice) this.salePrice = Number(pd.salePrice);
        if (pd.interventions) this.interventions = pd.interventions;
      } catch (e) {
        console.error('Error reading saved plantation details:', e);
      }
    }

    this.recalculate();
  }

  selectSpecies(speciesKey: string): void {
    this.selectedSpecies = speciesKey;
    this.loadSpeciesDefaults(speciesKey);
  }

  loadSpeciesDefaults(speciesKey: string): void {
    const defaults = SPECIES_DEFAULTS[speciesKey] || SPECIES_DEFAULTS['IMC'];
    this.stockingDensity = defaults.stockingDensity;
    this.stockingWeightG = defaults.stockingWeightG;
    this.finalHarvestWeightG = defaults.finalHarvestWeightG;
    this.cultureDurationDays = defaults.cultureDurationDays;
    this.survivalFraction = defaults.survivalFraction;
    this.farmReportedFcr = defaults.fcrBaseline;
    this.feedProtein = defaults.feedProtein;
    this.feedCarbon = defaults.feedCarbon;
    this.feedMfgEF = defaults.feedMfgEF;
    this.nitrogenRetention = defaults.nitrogenRetention;
    this.carbonRetention = defaults.carbonRetention;
    this.anaerobicBaseline = defaults.anaerobicBaseline;
    this.n2oEF = defaults.n2oEF;
    this.gridElectricityKwh = defaults.gridElectricityKwh;
    this.dieselBaseline = defaults.dieselL;
    this.seedPrice = defaults.seedPrice;
    this.feedPrice = defaults.feedPrice;
    this.salePrice = defaults.salePrice;
    this.labourCost = defaults.labourCost;
    this.probioticsCost = defaults.probioticsCost;
    this.otherCosts = defaults.otherCosts;

    this.recalculate();
  }

  toggleIntervention(key: string): void {
    this.interventions[key] = !this.interventions[key];
    this.recalculate();
  }

  recalculate(isUserAction: boolean = false): void {
    if (isUserAction) {
      this.isFlashing = true;
      this.showRecalcFloatingAlert = true;
      this.recalculateSuccessMessage = 'Portfolio Carbon Estimation Recalculated Successfully!';
    }

    const currentMob = localStorage.getItem('currentUserMobile') || '';
    const savedPlantation = this.registrationService.getDraftData('SellerPlantationDetails', currentMob);
    if (savedPlantation) {
      try {
        const pd = savedPlantation;
        if (pd.ponds && Array.isArray(pd.ponds) && pd.ponds.length > 0) {
          this.ponds = pd.ponds;
        }
      } catch (e) {
        console.error('Error reading saved plantation details:', e);
      }
    }

    if (this.selectedLandType === 'Open Land' || this.selectedLandType === 'Govt Land' || this.selectedLandType === 'House' || (this.selectedLandType !== 'Fish Pond' && (!this.ponds || this.ponds.length === 0))) {
      this.treeMangroveResult = this.calculatorService.calculateTreeMangroveCarbon({
        landType: this.selectedLandType || 'Open Land',
        smallTreeCount: this.smallTreeCount,
        mediumTreeCount: this.mediumTreeCount,
        largeTreeCount: this.largeTreeCount,
        mangroveAreaHa: this.mangroveAreaHa,
        biomassFactor: this.biomassFactor,
        creditRateInr: this.currentMarketRate
      });

      this.overallSummary = {
        totalCO2Reduction: this.treeMangroveResult.summary.totalCO2eStoredTonnes,
        totalCarbonCredits: this.treeMangroveResult.summary.totalCarbonCredits,
        totalProductionKg: 0,
        totalAreaHa: this.mangroveAreaHa || this.pondArea || 1.0,
        currentMarketRate: this.currentMarketRate,
        portfolioValue: this.treeMangroveResult.summary.portfolioValueInr
      };

      const calcPayload = {
        landType: this.selectedLandType,
        treeMangroveResult: this.treeMangroveResult,
        overallSummary: this.overallSummary
      };

      this.registrationService.setDraftData('SellerCalculatorDetails', calcPayload, currentMob);
      this.registrationService.setDraftData('SellerCalculation', {
        estimatedCO2: this.treeMangroveResult.summary.totalCarbonCredits,
        carbonCredits: this.treeMangroveResult.summary.totalCarbonCredits,
        marketValue: this.treeMangroveResult.summary.portfolioValueInr
      }, currentMob);
    } else if (this.ponds && this.ponds.length > 0) {
      const multiRes = this.calculatorService.calculateMultiPond(this.ponds, this.currentMarketRate);
      this.pondResults = multiRes.pondResults;
      this.overallSummary = multiRes.overallSummary;
      this.results = multiRes.pondResults[0]?.fullResults || null;

      const calcPayload = {
        ponds: this.ponds,
        pondResults: this.pondResults,
        overallSummary: this.overallSummary,
        results: this.results
      };

      this.registrationService.setDraftData('SellerCalculatorDetails', calcPayload, currentMob);
      this.registrationService.setDraftData('SellerCalculation', {
        estimatedCO2: this.overallSummary.totalCarbonCredits,
        carbonCredits: this.overallSummary.totalCarbonCredits,
        marketValue: this.overallSummary.portfolioValue
      }, currentMob);
    } else {
      const payload = {
        cultureType: this.selectedSpecies,
        pondArea: this.pondArea,
        pondAreaUnit: this.pondAreaUnit,
        stockingDensity: this.stockingDensity,
        stockingWeightG: this.stockingWeightG,
        finalHarvestWeightG: this.finalHarvestWeightG,
        cultureDurationDays: this.cultureDurationDays,
        survivalFraction: this.survivalFraction,
        cropsPerYear: this.cropsPerYear,
        netBiomassGainTonnes: this.netBiomassGainTonnes,
        farmReportedFcr: this.farmReportedFcr,
        fcrImprovement: this.fcrImprovement,
        growthCurveType: this.growthCurveType,
        mortalityFeedFactor: this.mortalityFeedFactor,
        feedProtein: this.feedProtein,
        feedCarbon: this.feedCarbon,
        dobProportion: this.dobProportion,
        dobEF: this.dobEF,
        gncEF: this.gncEF,
        sbmEF: this.sbmEF,
        ddgsEF: this.ddgsEF,
        feedMfgEF: this.feedMfgEF,
        nitrogenRetention: this.nitrogenRetention,
        carbonRetention: this.carbonRetention,
        anaerobicBaseline: this.anaerobicBaseline,
        anaerobicImproved: this.anaerobicImproved,
        n2oEF: this.n2oEF,
        ch4OxidationFraction: this.ch4OxidationFraction,
        measuredCH4Baseline: this.measuredCH4Baseline,
        measuredCH4Improved: this.measuredCH4Improved,
        measuredN2OBaseline: this.measuredN2OBaseline,
        measuredN2OImproved: this.measuredN2OImproved,
        gridElectricityKwh: this.gridElectricityKwh,
        gridEf: this.gridEf,
        paddlewheelHp: this.paddlewheelHp,
        paddlewheelUnits: this.paddlewheelUnits,
        paddlewheelHours: this.paddlewheelHours,
        blowerKw: this.blowerKw,
        blowerHours: this.blowerHours,
        solarOffsetKwh: this.solarOffsetKwh,
        dieselL: this.dieselBaseline,
        dieselBaseline: this.dieselBaseline,
        dieselImproved: this.dieselImproved,
        generatorDieselL: this.generatorDieselL,
        dieselEf: this.dieselEf,
        gwpFramework: this.gwpFramework,
        feedPrice: this.feedPrice,
        seedPrice: this.seedPrice,
        salePrice: this.salePrice,
        electricityTariff: this.electricityTariff,
        dieselPrice: this.dieselPrice,
        labourCost: this.labourCost,
        probioticsCost: this.probioticsCost,
        otherCosts: this.otherCosts,
        interventions: this.interventions,
        biomassCarbonPct: this.biomassCarbonPct,
        edibleYieldFraction: this.edibleYieldFraction
      };

      this.results = this.calculatorService.calculateOnFrontend(payload);
      const creditsYear = this.results?.summary?.creditsPerYear || this.results?.summary?.creditsPerCrop || 0;
      const co2Red = this.results?.summary?.creditsPerCrop || 0;
      const prodKg = this.results?.farmSummary?.totalBiomassHarvestedKg || 0;
      const areaHa = this.results?.farmSummary?.pondAreaHa || 1.0;

      this.overallSummary = {
        totalCO2Reduction: co2Red,
        totalCarbonCredits: creditsYear,
        totalProductionKg: prodKg,
        totalAreaHa: areaHa,
        currentMarketRate: this.currentMarketRate,
        portfolioValue: creditsYear * this.currentMarketRate
      };

      this.pondResults = [{
        pondIndex: 1,
        pondName: 'POND 1',
        cultureType: 'Fish',
        species: this.selectedSpecies,
        pondArea: areaHa,
        pondAreaUnit: this.pondAreaUnit,
        totalProduction: prodKg,
        co2Reduction: co2Red,
        percentReduction: this.results?.summary?.percentReduction || 0,
        potentialCarbonCredits: creditsYear,
        creditsPerHaPerYear: this.results?.summary?.creditsPerHaPerYear || (areaHa > 0 ? creditsYear / areaHa : 0),
        fullResults: this.results
      }];

      try {
        localStorage.setItem('SellerCalculatorDetails', JSON.stringify({
          ...payload,
          results: this.results,
          pondResults: this.pondResults,
          overallSummary: this.overallSummary
        }));
        localStorage.setItem('SellerCalculation', JSON.stringify({
          estimatedCO2: creditsYear,
          carbonCredits: creditsYear,
          marketValue: creditsYear * this.currentMarketRate
        }));
      } catch (e) {
        console.warn('[Storage] Quota exceeded in calculator details, proceeding safely:', e);
      }
    }

    if (isUserAction) {
      setTimeout(() => {
        this.isFlashing = false;
      }, 300);

      setTimeout(() => {
        this.showRecalcFloatingAlert = false;
        this.recalculateSuccessMessage = '';
      }, 800);
    }
  }

  back(): void {
    this.router.navigate(['/plantation-details']);
  }

  next(): void {
    this.recalculate();
    this.router.navigate(['/consent']);
  }

  goToStep(step: number): void {
    const storedFurthest = localStorage.getItem('SellerFurthestStep');
    const furthest = storedFurthest ? parseInt(storedFurthest, 10) : 1;
    if (step <= furthest) {
      const stepRoutes = [
        '/user-type',
        '/personal-details',
        '/address-details',
        '/land-survey-details',
        '/plantation-details',
        '/carbon-calculator',
        '/consent',
        '/preview',
        '/seller/dashboard'
      ];
      this.router.navigate([stepRoutes[step - 1]]);
    }
  }
}
