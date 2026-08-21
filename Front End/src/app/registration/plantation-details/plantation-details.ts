import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalculatorService, SPECIES_DEFAULTS } from '../../services/calculator.service';
import { CustomSelectComponent } from '../../components/custom-select/custom-select';

export interface PondData {
  id: string;
  name: string;
  aquacultureType: string; // 'Fish' | 'Prawns'
  selectedSpecies: string;
  stockingDensity: number;
  stockingWeightG: number;
  partialHarvestWeightG: number;
  finalHarvestWeightG: number;
  cultureDurationDays: number;
  survivalFraction: number;
  aerationRequired?: boolean;
  averageFcr: number;
  improvedFcrTarget: number;
  pondAreaHa: number;
  unit: string;
  waterDepthM: number;
  cropsPerYear: number;
  gwpFramework: string;
  farmReportedFcr: number;
  growthCurveType: string;
  mortalityFeedFactor: number;
  eventDay: number;
  eventCountPerKg: number | null;
  eventPctHarvested: number;
  anaerobicFraction: number;
  anaerobicAdjustmentFactor: number;
  sedimentBurialFraction: number;
  ch4OxidationFraction: number;
  n2oEfPreset: string;
  n2oEfCustom: number;
  limeAppliedKg: number;
  limeEf: number;
  fertilizerNKg: number;
  fertilizerN2oEf: number;
  idleDays: number;
  idleEfKgco2ePerHaDay: number;
  measuredCh4Kg: number | null;
  measuredN2oKg: number | null;
  paddlewheelHp: number;
  paddlewheelUnits: number;
  paddlewheelHours: number;
  blowerKw: number;
  blowerHours: number;
  dieselL: number;
  generatorDieselL: number;
  gridKwh: number;
  solarOffsetKwh: number;
  dieselEf: number;
  gridEf: number;
  feedPrice: number;
  electricityTariff: number;
  dieselPrice: number;
  labourCost: number;
  probioticsCost: number;
  seedPrice: number;
  otherCosts: number;
  salePrice: number;
  interventions: Record<string, boolean>;
  biomassCarbonPct: number;
  edibleYieldFraction: number;
  // v3.4 IMC Field-Data MRV Specification Parameters
  preStockingSoc?: number;
  postHarvestSoc?: number;
  totalSoilNitrogen?: number;
  soilCnRatio?: number;
  bulkDensity?: number;
  samplingDepth?: number;
  qDob?: number;
  qGnc?: number;
  qSbm?: number;
  qDdgs?: number;
  punchBagFeeding?: boolean;
  preDawnDo?: number;
  h2sDetected?: boolean;
  cyanobacteriaAvg?: number;
  waterPh?: number;
  tanMgL?: number;
  secchiDepthCm?: number;
  diatomsPct?: number;
  greenAlgaePct?: number;
  zooplanktonScore?: number;
  latitude?: number;
  longitude?: number;
  farmId?: string;
  pondId?: string;
  operatorName?: string;
  stockingDate?: string;
  plannedHarvestDate?: string;
  actualHarvestDate?: string;
  seedQuantity?: number;
  actualHarvestWeightKg?: number;
  mrvStatus?: string;
  quantity: number;
  daysOfCulture: number;
  area: number;
}

export interface UploadedPdfItem {
  id: string;
  name: string;
  url: string | ArrayBuffer | null;
  fileSize?: string;
}

export function createDefaultPond(pondIndex: number, aquaType: string = 'Fish', species: string = 'IMC'): PondData {
  const specDefaults = SPECIES_DEFAULTS[species] || SPECIES_DEFAULTS['IMC'];
  return {
    id: `pond_${Date.now()}_${pondIndex}`,
    name: `POND ${pondIndex}`,
    aquacultureType: aquaType,
    selectedSpecies: species,
    stockingDensity: specDefaults.stockingDensity || 6250,
    stockingWeightG: specDefaults.stockingWeightG || 150,
    partialHarvestWeightG: 1000,
    finalHarvestWeightG: specDefaults.finalHarvestWeightG || 1500,
    cultureDurationDays: specDefaults.cultureDurationDays || 240,
    survivalFraction: specDefaults.survivalFraction || 0.80,
    aerationRequired: false,
    averageFcr: specDefaults.fcrBaseline || 3.0,
    improvedFcrTarget: 2.5,
    pondAreaHa: 1.0,
    unit: 'Hectare',
    waterDepthM: 1.5,
    cropsPerYear: 1.5,
    gwpFramework: 'AR5',
    farmReportedFcr: specDefaults.fcrBaseline || 3.0,
    growthCurveType: 'Exponential',
    mortalityFeedFactor: 0.5,
    eventDay: 200,
    eventCountPerKg: null,
    eventPctHarvested: 0.20,
    anaerobicFraction: specDefaults.anaerobicBaseline || 0.20,
    anaerobicAdjustmentFactor: 1.0,
    sedimentBurialFraction: 0.20,
    ch4OxidationFraction: 0.25,
    n2oEfPreset: '0.71%',
    n2oEfCustom: specDefaults.n2oEF || 0.008,
    limeAppliedKg: 200,
    limeEf: 0.12,
    fertilizerNKg: 0,
    fertilizerN2oEf: 0.01,
    idleDays: 20,
    idleEfKgco2ePerHaDay: 2.0,
    measuredCh4Kg: null,
    measuredN2oKg: null,
    paddlewheelHp: 2,
    paddlewheelUnits: 4,
    paddlewheelHours: 8,
    blowerKw: 0,
    blowerHours: 0,
    dieselL: specDefaults.dieselL || 500,
    generatorDieselL: 200,
    gridKwh: specDefaults.gridElectricityKwh || 500,
    solarOffsetKwh: 0,
    dieselEf: 3.0,
    gridEf: 0.710,
    feedPrice: specDefaults.feedPrice || 45,
    electricityTariff: 7.0,
    dieselPrice: 92,
    labourCost: specDefaults.labourCost || 60000,
    probioticsCost: specDefaults.probioticsCost || 25000,
    seedPrice: specDefaults.seedPrice || 3.5,
    otherCosts: specDefaults.otherCosts || 20000,
    salePrice: specDefaults.salePrice || 130,
    interventions: {
      betterFeed: true,
      waterProbiotics: true,
      soilProbiotics: true,
      betterAeration: false,
      waterQualityMgmt: true,
      optimizedFeeding: true,
      cnRatioMgmt: false
    },
    biomassCarbonPct: 0.08,
    edibleYieldFraction: 0.65,
    preStockingSoc: 1.20,
    postHarvestSoc: 1.45,
    totalSoilNitrogen: 0.15,
    soilCnRatio: 12.0,
    bulkDensity: 1.25,
    samplingDepth: 0.15,
    qDob: 0,
    qGnc: 0,
    qSbm: 0,
    qDdgs: 0,
    punchBagFeeding: false,
    preDawnDo: 4.5,
    h2sDetected: false,
    cyanobacteriaAvg: 15.0,
    waterPh: 7.5,
    tanMgL: 0.5,
    secchiDepthCm: 35,
    diatomsPct: 40.0,
    greenAlgaePct: 35.0,
    zooplanktonScore: 2,
    latitude: 16.5062,
    longitude: 80.6480,
    farmId: 'FARM-001',
    pondId: `POND-00${pondIndex}`,
    operatorName: 'Farmer',
    stockingDate: '',
    plannedHarvestDate: '',
    actualHarvestDate: '',
    seedQuantity: specDefaults.stockingDensity || 6250,
    actualHarvestWeightKg: 7500,
    mrvStatus: 'PASS',
    quantity: specDefaults.stockingDensity || 6250,
    daysOfCulture: specDefaults.cultureDurationDays || 240,
    area: 1.0
  };
}

import { RegistrationService } from '../../services/registration.service';

@Component({
  selector: 'app-plantation-details',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './plantation-details.html',
  styleUrl: './plantation-details.css',
})
export class PlantationDetailsComponent implements OnInit, OnDestroy {
  unitOptions: string[] = ['Acre', 'Hectare', 'Sq.ft', 'Guntha', 'Sq.Yards'];
  gwpOptions = [
    { label: 'IPCC AR5 (CH4=28, N2O=265)', value: 'AR5' },
    { label: 'IPCC AR6 (CH4=27, N2O=273)', value: 'AR6' }
  ];
  growthCurveOptions = [
    { label: 'Exponential Growth', value: 'Exponential' },
    { label: 'Logistic Growth', value: 'Logistic' }
  ];
  n2oEfPresetOptions = [
    { label: '0.71% (Default)', value: '0.71%' },
    { label: '1.8% (High Input)', value: '1.8%' },
    { label: 'Custom Override', value: 'Custom' }
  ];
  private pollingIntervalId: any;

  // Form properties
  selectedLandType: string = '';
  selectedPlantationType: string = '';
  
  // Standard non-FishPond properties
  quantity: number | null = null;
  age: number | null = null;
  area: number | null = null;
  unit: string = '';
  daysOfCulture: number | null = null;
  selectedSubCategory: string = '';

  // Tree & Mangrove Carbon Sequestration Inventory (Verra VM0047/VM0033 for Open Land, Govt Land, House)
  smallTreeCount: number | null = null;
  mediumTreeCount: number | null = null;
  largeTreeCount: number | null = null;
  mangroveAreaHa: number | null = null;
  biomassFactor: number | null = null;

  gwpOptionsList: string[] = ['AR5', 'AR6'];
  growthCurveOptionsList: string[] = ['Exponential', 'Logistic'];
  n2oEfPresetOptionsList: string[] = ['0.71%', '1.8%', 'Custom'];
  yesNoOptions: string[] = ['No', 'Yes'];

  toggleIntervention(measureKey: string): void {
    const pond = this.getActivePond();
    if (!pond.interventions) {
      pond.interventions = {};
    }
    pond.interventions[measureKey] = !pond.interventions[measureKey];
  }

  biomassFactorOptions: string[] = [
    '1.00 - Standard Average Tropical Tree (Default)',
    '0.30 - Palms / Coconut Plantation (~0.30)',
    '0.80 - Softwood / Fast Growing Agroforest (~0.80)',
    '1.10 - Dense Hardwood / Teak / Rosewood (~1.10)'
  ];
  biomassFactorDisplay: string = '';

  getBiomassFactorLabel(val: number | null): string {
    if (val === null || val === undefined) return '';
    const num = Number(val);
    if (Math.abs(num - 0.30) < 0.01) return '0.30 - Palms / Coconut Plantation (~0.30)';
    if (Math.abs(num - 0.80) < 0.01) return '0.80 - Softwood / Fast Growing Agroforest (~0.80)';
    if (Math.abs(num - 1.10) < 0.01) return '1.10 - Dense Hardwood / Teak / Rosewood (~1.10)';
    return '1.00 - Standard Average Tropical Tree (Default)';
  }

  onBiomassFactorSelect(selectedOption: string): void {
    this.biomassFactorDisplay = selectedOption;
    if (!selectedOption) {
      this.biomassFactor = null;
      return;
    }
    if (selectedOption.includes('0.30')) {
      this.biomassFactor = 0.30;
    } else if (selectedOption.includes('0.80')) {
      this.biomassFactor = 0.80;
    } else if (selectedOption.includes('1.10')) {
      this.biomassFactor = 1.10;
    } else {
      this.biomassFactor = 1.00;
    }
  }

  // Multi-Pond Aquaculture State
  ponds: PondData[] = [];
  activePondIndex: number = 0;
  validationErrors: string[] = [];

  // PDF Upload properties (N-numbers of PDFs supported)
  uploadedPdfs: UploadedPdfItem[] = [];
  isUploadingPdf: boolean = false;
  pdfUploadSuccessMsg: string = '';
  private pdfMsgTimeoutId: any = null;

  onPdfUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input?.files;
    if (files && files.length > 0) {
      const fileList: File[] = Array.from(files);
      let validAdded = 0;

      fileList.forEach((file) => {
        if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
          alert(`File "${file.name}" is not a valid PDF file.`);
          return;
        }

        // Instant Object URL (0ms latency)
        let objectUrl: string | null = null;
        try {
          objectUrl = URL.createObjectURL(file);
        } catch (e) {
          objectUrl = null;
        }

        const sizeKb = (file.size / 1024).toFixed(1);
        const item: UploadedPdfItem = {
          id: `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          url: objectUrl,
          fileSize: `${sizeKb} KB`
        };

        // INSTANT UI UPDATE - render chip immediately in 0ms!
        this.uploadedPdfs = [...this.uploadedPdfs, item];
        validAdded++;

        // Async draft sync in background so UI never blocks
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            item.url = e.target.result as string;
            this.syncPdfDraftData();
          }
        };
        reader.readAsDataURL(file);
      });

      if (validAdded > 0) {
        this.pdfUploadSuccessMsg = validAdded > 1
          ? `${validAdded} PDF files added!`
          : `PDF "${fileList[0].name}" added!`;

        this.syncPdfDraftData();

        if (this.pdfMsgTimeoutId) {
          clearTimeout(this.pdfMsgTimeoutId);
        }
        this.pdfMsgTimeoutId = setTimeout(() => {
          this.pdfUploadSuccessMsg = '';
          this.pdfMsgTimeoutId = null;
        }, 3000);
      }

      input.value = '';
    }
  }

  removeUploadedPdf(pdfId: string): void {
    this.uploadedPdfs = this.uploadedPdfs.filter(pdf => pdf.id !== pdfId);
    this.pdfUploadSuccessMsg = '';
    this.syncPdfDraftData();
  }

  private syncPdfDraftData(): void {
    const currentDraft = this.registrationService.getDraftData('SellerPlantationDetails') || {};
    this.registrationService.setDraftData('SellerPlantationDetails', {
      ...currentDraft,
      uploadedPdfs: this.uploadedPdfs,
      uploadedPdfName: this.uploadedPdfs.length > 0 ? this.uploadedPdfs[0].name : '',
      uploadedPdfUrl: this.uploadedPdfs.length > 0 ? this.uploadedPdfs[0].url : null
    });
  }

  constructor(
    private router: Router,
    private calculatorService: CalculatorService,
    private registrationService: RegistrationService
  ) {
    const currentStep = 5;
    const storedFurthest = localStorage.getItem('SellerFurthestStep');
    const furthest = storedFurthest ? parseInt(storedFurthest, 10) : 1;
    if (currentStep > furthest) {
      localStorage.setItem('SellerFurthestStep', currentStep.toString());
    }
  }

  ngOnInit(): void {
    const details = this.registrationService.getDraftData('SellerPlantationDetails');
    if (details) {
      this.selectedLandType = details.landType || '';
      this.selectedPlantationType = details.plantationType || '';
      this.selectedSubCategory = details.subCategory || '';
      this.quantity = details.quantity ?? null;
      this.age = details.age ?? null;
      this.area = details.area ?? null;
      this.unit = details.unit || '';
      this.smallTreeCount = details.smallTreeCount ?? null;
      this.mediumTreeCount = details.mediumTreeCount ?? null;
      this.largeTreeCount = details.largeTreeCount ?? null;
      this.mangroveAreaHa = details.mangroveAreaHa ?? null;
      this.biomassFactor = details.biomassFactor ?? null;
      this.biomassFactorDisplay = this.getBiomassFactorLabel(this.biomassFactor);

      if (details.uploadedPdfs && Array.isArray(details.uploadedPdfs)) {
        this.uploadedPdfs = details.uploadedPdfs;
      } else if (details.uploadedPdfName) {
        this.uploadedPdfs = [{
          id: 'pdf_legacy_1',
          name: details.uploadedPdfName,
          url: details.uploadedPdfUrl || null
        }];
      } else {
        this.uploadedPdfs = [];
      }

      if (details.ponds && Array.isArray(details.ponds) && details.ponds.length > 0) {
        this.ponds = details.ponds;
        this.activePondIndex = 0;
      }
    } else {
      this.selectedLandType = '';
      this.selectedPlantationType = '';
      this.quantity = null;
      this.age = null;
      this.area = null;
      this.unit = '';
      this.smallTreeCount = null;
      this.mediumTreeCount = null;
      this.largeTreeCount = null;
      this.mangroveAreaHa = null;
      this.biomassFactor = null;
      this.biomassFactorDisplay = '';
      this.uploadedPdfs = [];
    }

    if (this.selectedLandType === 'Fish Pond' && (this.selectedPlantationType === 'Fish' || this.selectedPlantationType === 'Prawns')) {
      if (this.ponds.length === 0) {
        const initialSpecies = this.selectedPlantationType === 'Prawns' ? 'P. vannamei' : 'IMC';
        this.ponds = [createDefaultPond(1, this.selectedPlantationType, initialSpecies)];
        this.activePondIndex = 0;
      }
    }

    this.validateActivePond();
  }

  ngOnDestroy(): void {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
    }
    if (this.pdfMsgTimeoutId) {
      clearTimeout(this.pdfMsgTimeoutId);
    }
  }

  // ================= LAND TYPE =================

  selectLandType(type: string): void {
    this.selectedLandType = type;
    this.selectedPlantationType = '';
    this.selectedSubCategory = '';
    this.ponds = [];
    this.activePondIndex = 0;
    this.validationErrors = [];
  }

  // ================= PLANTATION TYPE / CATEGORY =================

  selectPlantationType(type: string): void {
    this.selectedPlantationType = type;
    this.selectedSubCategory = '';
    
    if (this.selectedLandType === 'Fish Pond') {
      // System automatically creates POND 1 (Default)
      const defaultSpecies = type === 'Prawns' ? 'P. vannamei' : 'IMC';
      this.ponds = [createDefaultPond(1, type, defaultSpecies)];
      this.activePondIndex = 0;
      this.validateActivePond();
    }
  }

  // ================= POND MANAGEMENT =================

  getActivePond(): PondData {
    if (this.ponds.length === 0) {
      const defaultSpecies = this.selectedPlantationType === 'Prawns' ? 'P. vannamei' : 'IMC';
      this.ponds = [createDefaultPond(1, this.selectedPlantationType || 'Fish', defaultSpecies)];
      this.activePondIndex = 0;
    }
    if (this.activePondIndex >= this.ponds.length) {
      this.activePondIndex = Math.max(0, this.ponds.length - 1);
    }
    return this.ponds[this.activePondIndex];
  }

  selectSpeciesForActivePond(speciesKey: string): void {
    const activePond = this.getActivePond();
    activePond.selectedSpecies = speciesKey;
    
    // Load species defaults into active pond
    const specDefaults = SPECIES_DEFAULTS[speciesKey] || SPECIES_DEFAULTS['IMC'];
    activePond.stockingDensity = specDefaults.stockingDensity || activePond.stockingDensity;
    activePond.stockingWeightG = specDefaults.stockingWeightG || activePond.stockingWeightG;
    activePond.finalHarvestWeightG = specDefaults.finalHarvestWeightG || activePond.finalHarvestWeightG;
    activePond.cultureDurationDays = specDefaults.cultureDurationDays || activePond.cultureDurationDays;
    activePond.survivalFraction = specDefaults.survivalFraction || activePond.survivalFraction;
    activePond.averageFcr = specDefaults.fcrBaseline || activePond.averageFcr;
    activePond.farmReportedFcr = specDefaults.fcrBaseline || activePond.farmReportedFcr;
    activePond.feedPrice = specDefaults.feedPrice || activePond.feedPrice;
    activePond.salePrice = specDefaults.salePrice || activePond.salePrice;
    activePond.seedPrice = specDefaults.seedPrice || activePond.seedPrice;
    activePond.labourCost = specDefaults.labourCost || activePond.labourCost;
    activePond.probioticsCost = specDefaults.probioticsCost || activePond.probioticsCost;
    activePond.otherCosts = specDefaults.otherCosts || activePond.otherCosts;
    activePond.dieselL = specDefaults.dieselL || activePond.dieselL;
    activePond.gridKwh = specDefaults.gridElectricityKwh || activePond.gridKwh;
    activePond.quantity = activePond.stockingDensity;
    activePond.daysOfCulture = activePond.cultureDurationDays;

    this.validateActivePond();
  }

  switchPond(index: number): void {
    if (index >= 0 && index < this.ponds.length) {
      this.activePondIndex = index;
      this.validateActivePond();
    }
  }

  addPond(): void {
    if (!this.isActivePondValid()) {
      alert(`Please fix validation errors for ${this.getActivePond().name} before adding a new pond.`);
      return;
    }

    const nextPondNumber = this.ponds.length + 1;
    const defaultSpecies = this.selectedPlantationType === 'Prawns' ? 'P. vannamei' : 'Roopchand';
    const newPond = createDefaultPond(nextPondNumber, this.selectedPlantationType, defaultSpecies);
    this.ponds.push(newPond);
    this.activePondIndex = this.ponds.length - 1;
    this.validateActivePond();
  }

  removePond(index: number): void {
    if (this.ponds.length <= 1) {
      alert('At least one pond is required.');
      return;
    }

    this.ponds.splice(index, 1);
    // Renumber ponds
    this.ponds.forEach((p, idx) => {
      p.name = `POND ${idx + 1}`;
    });

    if (this.activePondIndex >= this.ponds.length) {
      this.activePondIndex = this.ponds.length - 1;
    }
    this.validateActivePond();
  }

  // ================= VALIDATION LOGIC =================

  validatePondData(pond: PondData): string[] {
    const errors: string[] = [];

    if (!pond.selectedSpecies) {
      errors.push('Species selection is required.');
    }

    if (!pond.pondAreaHa || pond.pondAreaHa <= 0) {
      errors.push('Pond Area must be greater than 0.');
    }

    if (!pond.stockingDensity || pond.stockingDensity <= 0) {
      errors.push('Stocking Density / Stock Quantity must be greater than 0.');
    }

    if (!pond.cultureDurationDays || pond.cultureDurationDays <= 0) {
      errors.push('Culture Duration (Days) must be greater than 0.');
    }

    if (!pond.survivalFraction || pond.survivalFraction <= 0 || pond.survivalFraction > 1) {
      errors.push('Survival Fraction must be between 0.01 and 1.0.');
    }

    if (!pond.averageFcr || pond.averageFcr <= 0) {
      errors.push('Baseline FCR must be greater than 0.');
    }

    if (!pond.feedPrice || pond.feedPrice <= 0) {
      errors.push('Feed Price (₹/kg) must be greater than 0.');
    }

    if (!pond.salePrice || pond.salePrice <= 0) {
      errors.push('Harvest Sale Price (₹/kg) must be greater than 0.');
    }

    return errors;
  }

  validateActivePond(): boolean {
    if (this.selectedLandType !== 'Fish Pond') {
      this.validationErrors = [];
      return true;
    }

    const activePond = this.getActivePond();
    this.validationErrors = this.validatePondData(activePond);
    return this.validationErrors.length === 0;
  }

  isActivePondValid(): boolean {
    return this.validateActivePond();
  }

  // ================= NAVIGATION =================

  back(): void {
    this.router.navigate(['/land-survey-details']);
  }

  next(): void {
    if (!this.selectedLandType) {
      alert('Please select a land type');
      return;
    }

    if (!this.selectedPlantationType) {
      alert('Please select a category');
      return;
    }

    if (this.selectedLandType === 'Fish Pond') {
      if (this.ponds.length === 0) {
        alert('Please complete Pond 1 details before proceeding.');
        return;
      }

      // Validate every single pond
      for (let i = 0; i < this.ponds.length; i++) {
        const pErrors = this.validatePondData(this.ponds[i]);
        if (pErrors.length > 0) {
          this.activePondIndex = i;
          this.validationErrors = pErrors;
          alert(`Validation failed for ${this.ponds[i].name}. Please fill all required fields.`);
          return;
        }
      }

      // Sync active pond parameters into quantity, area, days for backward compatibility
      const p1 = this.ponds[0];
      const totalAreaAcrossPonds = this.ponds.reduce((sum, p) => sum + Number(p.pondAreaHa || (p as any).area || (p as any).pondArea || 0), 0);
      const totalStockAcrossPonds = this.ponds.reduce((sum, p) => sum + Number(p.stockingDensity || (p as any).quantity || 0), 0);

      this.quantity = totalStockAcrossPonds > 0 ? totalStockAcrossPonds : p1.stockingDensity;
      this.daysOfCulture = p1.cultureDurationDays;
      this.area = totalAreaAcrossPonds > 0 ? totalAreaAcrossPonds : p1.pondAreaHa;
      this.unit = p1.unit || 'Hectare';
      this.selectedSubCategory = p1.selectedSpecies;
      this.age = parseFloat(((p1.cultureDurationDays || 240) / 30).toFixed(1));

      // Calculate multi-pond carbon footprint
      const multiCalcResults = this.calculatorService.calculateMultiPond(this.ponds);

      // Save selected data to local storage for subsequent steps
      const aquaPayload = {
        landType: this.selectedLandType,
        plantationType: this.selectedPlantationType,
        subCategory: p1.selectedSpecies,
        quantity: this.quantity,
        age: this.age,
        area: this.area,
        unit: this.unit,
        daysOfCulture: this.daysOfCulture,
        ponds: this.ponds,
        multiPondSummary: multiCalcResults.overallSummary,

        // Single pond parameters (Pond 1 default)
        stockingDensity: p1.stockingDensity,
        stockingWeightG: p1.stockingWeightG,
        partialHarvestWeightG: p1.partialHarvestWeightG,
        finalHarvestWeightG: p1.finalHarvestWeightG,
        cultureDurationDays: p1.cultureDurationDays,
        survivalFraction: p1.survivalFraction,
        averageFcr: p1.averageFcr,
        improvedFcrTarget: p1.improvedFcrTarget,
        pondAreaHa: p1.pondAreaHa,
        waterDepthM: p1.waterDepthM,
        cropsPerYear: p1.cropsPerYear,
        gwpFramework: p1.gwpFramework,
        farmReportedFcr: p1.farmReportedFcr,
        growthCurveType: p1.growthCurveType,
        mortalityFeedFactor: p1.mortalityFeedFactor,
        eventDay: p1.eventDay,
        eventCountPerKg: p1.eventCountPerKg,
        eventPctHarvested: p1.eventPctHarvested,
        anaerobicFraction: p1.anaerobicFraction,
        anaerobicAdjustmentFactor: p1.anaerobicAdjustmentFactor,
        sedimentBurialFraction: p1.sedimentBurialFraction,
        ch4OxidationFraction: p1.ch4OxidationFraction,
        n2oEfPreset: p1.n2oEfPreset,
        n2oEfCustom: p1.n2oEfCustom,
        limeAppliedKg: p1.limeAppliedKg,
        limeEf: p1.limeEf,
        fertilizerNKg: p1.fertilizerNKg,
        fertilizerN2oEf: p1.fertilizerN2oEf,
        idleDays: p1.idleDays,
        idleEfKgco2ePerHaDay: p1.idleEfKgco2ePerHaDay,
        measuredCh4Kg: p1.measuredCh4Kg,
        measuredN2oKg: p1.measuredN2oKg,
        paddlewheelHp: p1.paddlewheelHp,
        paddlewheelUnits: p1.paddlewheelUnits,
        paddlewheelHours: p1.paddlewheelHours,
        blowerKw: p1.blowerKw,
        blowerHours: p1.blowerHours,
        dieselL: p1.dieselL,
        generatorDieselL: p1.generatorDieselL,
        gridKwh: p1.gridKwh,
        solarOffsetKwh: p1.solarOffsetKwh,
        dieselEf: p1.dieselEf,
        gridEf: p1.gridEf,
        feedPrice: p1.feedPrice,
        electricityTariff: p1.electricityTariff,
        dieselPrice: p1.dieselPrice,
        seedPrice: p1.seedPrice,
        labourCost: p1.labourCost,
        probioticsCost: p1.probioticsCost,
        otherCosts: p1.otherCosts,
        salePrice: p1.salePrice,
        biomassCarbonPct: p1.biomassCarbonPct,
        interventions: p1.interventions,
        uploadedPdfs: this.uploadedPdfs,
        uploadedPdfName: this.uploadedPdfs.length > 0 ? this.uploadedPdfs[0].name : '',
        uploadedPdfUrl: this.uploadedPdfs.length > 0 ? this.uploadedPdfs[0].url : null
      };
      this.registrationService.setDraftData('SellerPlantationDetails', aquaPayload);
    } else {
      if (!this.quantity || this.quantity <= 0) {
        alert('Please enter a valid quantity');
        return;
      }

      if (!this.age || this.age <= 0) {
        alert('Please enter a valid age');
        return;
      }

      if (!this.area || this.area <= 0) {
        alert('Please enter a valid area');
        return;
      }

      if (!this.unit) {
        alert('Please select a unit');
        return;
      }

      this.registrationService.setDraftData('SellerPlantationDetails', {
        landType: this.selectedLandType,
        plantationType: this.selectedPlantationType,
        subCategory: this.selectedSubCategory,
        quantity: this.quantity,
        age: this.age,
        area: this.area,
        unit: this.unit,
        smallTreeCount: this.smallTreeCount || 0,
        mediumTreeCount: this.mediumTreeCount || 0,
        largeTreeCount: this.largeTreeCount || 0,
        mangroveAreaHa: this.mangroveAreaHa || 0,
        biomassFactor: this.biomassFactor || 1.00,
        uploadedPdfs: this.uploadedPdfs,
        uploadedPdfName: this.uploadedPdfs.length > 0 ? this.uploadedPdfs[0].name : '',
        uploadedPdfUrl: this.uploadedPdfs.length > 0 ? this.uploadedPdfs[0].url : null
      });
    }

    this.router.navigate(['/carbon-calculator']);
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
