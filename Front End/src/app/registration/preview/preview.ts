import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MockDatabaseService } from '../../services/mock-db.service';
import { RegistrationService } from '../../services/registration.service';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview.html',
  styleUrl: './preview.css'
})
export class PreviewComponent implements OnInit {
  isSubmitting: boolean = false;
  // Personal Details
  selectedUserType: string = '';
  fullName: string = '';
  gender: string = '';
  divisionName: string = '';
  mobileNumber: string = '';
  aadhaarNumber: string = '';
  aadhaarPhoto: string = '';
  aadhaarPhotoName: string = '';
  managerName: string = '';
  managerId: string = '';
  panNumber: string = '';
  panPhoto: string = '';
  panPhotoName: string = '';
  emailAddress: string = '';
  registrationId: string = '';
  gstNumber: string = '';

  // Address Details
  state: string = '';
  district: string = '';
  mandal: string = '';
  village: string = '';
  pincode: string = '';

  // Land Details
  surveyNo: string = '';
  subDivisionNo: string = '';
  surveyEntries: Array<{ surveyNo: string; subDivisionNo: string }> = [];
  landArea: number = 0;
  landUnit: string = 'Acre';
  latitude: number | null = null;
  longitude: number | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  pattadarDoc: string = '';
  pattadarDocName: string = '';

  // Plantation / Multi-Pond Details
  landType: string = 'Open Land';
  plantationType: string = '';
  subCategory: string = '';
  quantity: number = 0;
  plantationArea: number = 0;
  plantationUnit: string = 'Acre';
  age: number = 0;
  ponds: any[] = [];

  qtyFeedConsumed: number = 0;
  fcr: number = 0;
  daysOfCulture: number = 0;

  // Calculation Results
  estimatedCO2: number = 0;
  carbonCredits: number = 0;
  marketValue: number = 0;
  remarks: string = '';
  plantationDataRaw: any = {};

  constructor(
    private router: Router,
    private dbService: MockDatabaseService,
    private registrationService: RegistrationService
  ) {
    const currentStep = 8;
    const storedFurthest = localStorage.getItem('SellerFurthestStep');
    const furthest = storedFurthest ? parseInt(storedFurthest, 10) : 1;
    if (currentStep > furthest) {
      localStorage.setItem('SellerFurthestStep', currentStep.toString());
    }
  }

  ngOnInit(): void {
    this.selectedUserType = localStorage.getItem('selectedUserType') || '';
    const currentMob = localStorage.getItem('currentUserMobile') || localStorage.getItem('loginMobile') || '';

    // 1. Personal Details
    const pd = this.registrationService.getDraftData('SellerPersonalDetails', currentMob);
    if (pd) {
      this.fullName = pd.fullName || this.fullName;
      this.gender = pd.gender || '';
      this.mobileNumber = pd.mobileNumber || currentMob || this.mobileNumber;
      this.aadhaarNumber = pd.aadhaarNumber || this.aadhaarNumber;
      this.aadhaarPhoto = pd.aadhaarPhoto || pd.aadhaarPhotoPreview || '';
      this.aadhaarPhotoName = pd.aadhaarPhotoName || (this.aadhaarPhoto ? 'Aadhaar Card Photo' : '');
      this.panNumber = pd.panNumber || this.panNumber;
      this.panPhoto = pd.panPhoto || pd.panPhotoPreview || '';
      this.panPhotoName = pd.panPhotoName || (this.panPhoto ? 'PAN Card Photo' : '');
      this.emailAddress = pd.emailAddress || this.emailAddress;
      this.divisionName = pd.divisionName || '';
      this.managerName = pd.managerName || '';
      this.managerId = pd.managerId || '';
      this.registrationId = pd.registrationId || '';
      this.gstNumber = pd.gstNumber || '';
    }

    // Fallback if fullName or mobileNumber is missing
    if (!this.fullName || !this.mobileNumber) {
      const userStr = localStorage.getItem('currentUser') || localStorage.getItem('user');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          this.fullName = this.fullName || userObj.fullName || userObj.name || '';
          this.mobileNumber = this.mobileNumber || userObj.mobileNumber || userObj.mobile || currentMob;
          this.gender = this.gender || userObj.gender || '';
          this.aadhaarNumber = this.aadhaarNumber || userObj.aadhaarNumber || '';
          this.panNumber = this.panNumber || userObj.panNumber || '';
        } catch (e) {}
      }
    }

    // 2. Address Details
    const ad = this.registrationService.getDraftData('SellerAddressDetails', currentMob);
    if (ad) {
      this.state = ad.state || this.state;
      this.district = ad.district || this.district;
      this.mandal = ad.mandal || this.mandal;
      this.village = ad.village || this.village;
      this.pincode = ad.pincode || this.pincode;
    }

    // 3. Land Details
    const ld = this.registrationService.getDraftData('SellerLandDetails', currentMob);
    if (ld) {
      if (Array.isArray(ld.surveyEntries) && ld.surveyEntries.length > 0) {
        this.surveyEntries = ld.surveyEntries;
        this.surveyNo = ld.surveyNo || this.surveyEntries.map(e => e.surveyNo).filter(Boolean).join(', ');
        this.subDivisionNo = ld.subDivisionNo || this.surveyEntries.map(e => e.subDivisionNo).filter(Boolean).join(', ');
      } else {
        this.surveyNo = ld.surveyNo || this.surveyNo;
        this.subDivisionNo = ld.subDivisionNo || this.subDivisionNo;
        this.surveyEntries = [{
          surveyNo: this.surveyNo,
          subDivisionNo: this.subDivisionNo
        }];
      }
      this.landArea = ld.area !== undefined ? Number(ld.area) : this.landArea;
      this.landUnit = ld.unit || this.landUnit;
      this.latitude = ld.latitude || null;
      this.longitude = ld.longitude || null;
      this.imagePreview = ld.imagePreview || null;
      this.pattadarDoc = ld.pattadarDoc || ld.pattadarDocPreview || '';
      this.pattadarDocName = ld.pattadarDocName || (this.pattadarDoc ? 'Pattadar Passbook Document' : '');
    }

    // 4. Plantation Details
    const pld = this.registrationService.getDraftData('SellerPlantationDetails', currentMob);
    if (pld) {
      this.plantationDataRaw = pld;
      this.ponds = pld.ponds || [];
      this.landType = pld.landType || this.landType;
      this.plantationType = pld.plantationType || this.plantationType;
      this.subCategory = pld.subCategory || this.subCategory;
      this.quantity = pld.quantity || this.quantity;
      this.plantationArea = pld.area || this.plantationArea;
      this.plantationUnit = pld.unit || this.plantationUnit;
      this.age = pld.age || this.age;

      this.qtyFeedConsumed = pld.qtyFeedConsumed || 0;
      this.fcr = pld.fcr || 0;
      this.daysOfCulture = pld.daysOfCulture || (pld.age ? Math.round(pld.age * 30) : 0);
      this.remarks = pld.remarks || '';

      // For Multi-Pond Aquaculture, aggregate total quantity and total area across all ponds
      if (this.landType === 'Fish Pond' && this.ponds && this.ponds.length > 0) {
        const totalStock = this.ponds.reduce((sum, p) => sum + Number(p.stockingDensity || p.quantity || p.stockQuantity || 0), 0);
        const totalArea = this.ponds.reduce((sum, p) => sum + Number(p.pondAreaHa || p.area || p.pondArea || 0), 0);
        if (totalStock > 0) this.quantity = totalStock;
        if (totalArea > 0) this.plantationArea = totalArea;
      }
    }

    // 5. Calculation Results
    this.loadCalculationData();
    window.addEventListener('storage', () => {
      this.loadCalculationData();
    });
  }

  loadCalculationData(): void {
    const calculatorDetails = localStorage.getItem('SellerCalculatorDetails');
    if (calculatorDetails) {
      try {
        const calc = JSON.parse(calculatorDetails);
        
        // Priority 1: Check overallSummary (Aggregated across all ponds)
        if (calc.overallSummary) {
          this.estimatedCO2 = Number(calc.overallSummary.totalCO2Reduction || calc.overallSummary.totalCarbonCredits || 0);
          this.carbonCredits = Number(calc.overallSummary.totalCarbonCredits || 0);
          this.marketValue = Number(calc.overallSummary.portfolioValue || (this.carbonCredits * 120));
          return;
        }

        // Priority 2: Check pondResults array (Sum across all ponds)
        if (calc.pondResults && Array.isArray(calc.pondResults) && calc.pondResults.length > 0) {
          this.estimatedCO2 = calc.pondResults.reduce((sum: number, p: any) => sum + Number(p.co2Reduction || p.credits || 0), 0);
          this.carbonCredits = calc.pondResults.reduce((sum: number, p: any) => sum + Number(p.credits || 0), 0);
          this.marketValue = calc.pondResults.reduce((sum: number, p: any) => sum + Number(p.valuation || (p.credits * 120) || 0), 0);
          return;
        }

        const res = calc.results || calc;
        if (res && res.summary) {
          const annualCredits = Number(res.summary.creditsPerYear || res.summary.creditsPerCrop || 0);
          this.estimatedCO2 = Number(res.summary.creditsPerCrop || annualCredits);
          this.carbonCredits = annualCredits;
          this.marketValue = Number(res.summary.portfolioValue || (annualCredits * 120));
          return;
        } else if (calc.estimatedCO2 !== undefined || calc.carbonCredits !== undefined) {
          this.estimatedCO2 = Number(calc.estimatedCO2 || 0);
          this.carbonCredits = Number(calc.carbonCredits || 0);
          this.marketValue = Number(calc.marketValue || (this.carbonCredits * 120));
          return;
        }
      } catch (e) {
        console.error('Error parsing calculator details:', e);
      }
    }

    const calculationData = localStorage.getItem('SellerCalculation');
    if (calculationData) {
      try {
        const cd = JSON.parse(calculationData);
        this.estimatedCO2 = Number(cd.estimatedCO2 || cd.carbonCredits || 0);
        this.carbonCredits = Number(cd.carbonCredits || cd.estimatedCO2 || 0);
        this.marketValue = Number(cd.marketValue || (this.carbonCredits * 120));
      } catch (e) {
        console.error('Error parsing calculation details', e);
      }
    }
  }

  back(): void {
    this.router.navigate(['/consent']);
  }

  next(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in using OTP first to submit your registration.');
      this.router.navigate(['/login']);
      return;
    }

    const rawMobile = (this.mobileNumber && this.mobileNumber.trim().length >= 10) ? this.mobileNumber.trim() : (localStorage.getItem('currentUserMobile') || '+916786786780');
    const currentMobile = rawMobile.startsWith('+') ? rawMobile : '+91' + rawMobile;
    
    // 1. Resolve userTypeId
    let userTypeId = '1f40ec43-9b8c-499d-a4ae-691bd3400954'; // default Individual Seller
    if (this.selectedUserType === 'Farmer') userTypeId = 'ac60d096-bc04-43eb-ab15-c94433dadefd';
    else if (this.selectedUserType === 'FPO') userTypeId = '806fb343-a54b-4263-828a-92da20369c64';
    else if (this.selectedUserType === 'NGO') userTypeId = 'b89572ea-8bca-4a1c-8673-d17a54d32841';
    else if (this.selectedUserType === 'Community') userTypeId = '6947faea-981c-4d2e-98e8-97f515cab780';
    else if (this.selectedUserType === 'Government') userTypeId = '13bb0571-8097-44f4-aa22-e48c364efabf';

    const registrationTypeId = '1b48460c-643e-48e7-8515-c00bc3d414bf'; // SELLER

    this.isSubmitting = true;
    console.log('🚀 Sending consolidated registration submission...');

    const payload = {
      registrationTypeId,
      userTypeId,
      personalDetails: {
        fullName: this.fullName,
        gender: this.gender,
        divisionName: this.divisionName,
        mobileNumber: this.mobileNumber,
        aadhaarNumber: this.aadhaarNumber,
        managerName: this.managerName,
        managerId: this.managerId,
        panNumber: this.panNumber,
        emailAddress: this.emailAddress,
        registrationId: this.registrationId,
        gstNumber: this.gstNumber
      },
      addressDetails: {
        state: this.state,
        district: this.district,
        mandal: this.mandal,
        village: this.village,
        pincode: this.pincode
      },
      landDetails: {
        landTypeId: this.landType,
        surveyNumber: this.surveyNo,
        subDivisionNumber: this.subDivisionNo,
        surveyEntries: this.surveyEntries,
        totalArea: this.landArea,
        unitId: this.landUnit,
        latitude: this.latitude || 14.4450,
        longitude: this.longitude || 79.9860,
        photoId: 'photo_placeholder'
      },
      plantationDetails: {
        plantationCategoryId: this.plantationType,
        speciesName: this.subCategory || 'Teak',
        numberOfPlants: this.quantity,
        plantationAge: this.age,
        plantationArea: this.plantationArea,
        areaUnitId: this.plantationUnit,
        remarks: 'Registered via web wizard'
      },
      aquacultureDetails: {
        aquacultureType: this.plantationType,
        fishSpeciesId: this.subCategory || 'IMC',
        prawnSpeciesId: this.subCategory || 'Vannamei',
        stockQuantity: this.quantity || 1000,
        cultureDays: this.daysOfCulture || (this.age ? Math.round(this.age * 30) : 120),
        pondArea: this.plantationArea || this.landArea,
        areaUnitId: this.plantationUnit || this.landUnit,
        feedConsumed: this.qtyFeedConsumed || 500,
        feedUnitId: 'Kilogram',
        fcr: this.fcr || 1.2,
        ponds: this.ponds,
        remarks: this.remarks || 'Ponds registered via web wizard'
      },
      carbonCalculation: {
        estimatedCO2: this.estimatedCO2,
        carbonCredits: this.carbonCredits,
        marketValue: this.marketValue
      },
      consentDetails: {
        consentAccepted: true,
        declarationAccepted: true
      }
    };

    this.registrationService.submitFull(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        console.log('✅ Final Submit complete');
        alert('Successfully Registered and Submitted to C-PAY Bank!');

        // Run local storage completion logic
        this.dbService.createUser({
          fullName: this.fullName,
          mobileNumber: currentMobile,
          emailAddress: this.emailAddress || 'seller@cpay.com',
          userRole: 'Seller'
        });
        
        this.dbService.completeRegistration(currentMobile);
        localStorage.setItem('registrationSuccess', 'true');
        localStorage.setItem('loginMobile', currentMobile);
        localStorage.setItem('currentUserMobile', currentMobile);

        // Namespaced keys
        const personal = localStorage.getItem('SellerPersonalDetails');
        if (personal) localStorage.setItem(`SellerPersonalDetails_${currentMobile}`, personal);
        const address = localStorage.getItem('SellerAddressDetails');
        if (address) localStorage.setItem(`SellerAddressDetails_${currentMobile}`, address);
        const land = localStorage.getItem('SellerLandDetails');
        if (land) localStorage.setItem(`SellerLandDetails_${currentMobile}`, land);
        const plantation = localStorage.getItem('SellerPlantationDetails');
        if (plantation) localStorage.setItem(`SellerPlantationDetails_${currentMobile}`, plantation);
        const calculation = localStorage.getItem('SellerCalculation');
        if (calculation) localStorage.setItem(`SellerCalculation_${currentMobile}`, calculation);

        // Save uploaded document photos namespaced with all key variants
        const docsPayload = {
          panPhoto: this.panPhoto,
          panPhotoName: this.panPhotoName,
          aadhaarPhoto: this.aadhaarPhoto,
          aadhaarPhotoName: this.aadhaarPhotoName,
          pattadarDoc: this.pattadarDoc,
          pattadarDocName: this.pattadarDocName,
          imagePreview: this.imagePreview
        };
        const clean10 = currentMobile.replace(/[^0-9]/g, '').slice(-10);
        localStorage.setItem(`SellerDocs_${currentMobile}`, JSON.stringify(docsPayload));
        if (clean10) {
          localStorage.setItem(`SellerDocs_${clean10}`, JSON.stringify(docsPayload));
          localStorage.setItem(`SellerDocs_+91${clean10}`, JSON.stringify(docsPayload));
        }
        localStorage.setItem('SellerDocs', JSON.stringify(docsPayload));

        // Sync uploaded document photos directly to PostgreSQL database
        const returnedRegId = res.data?.registrationId || res.registrationId;
        if (returnedRegId) {
          if (this.imagePreview) {
            this.registrationService.uploadDocument(returnedRegId, 'LAND_PHOTO', null, String(this.imagePreview), 'Geo_Land_Site_Photo.jpg').subscribe({ error: (e) => console.error(e) });
          }
          if (this.panPhoto) {
            this.registrationService.uploadDocument(returnedRegId, 'PAN', null, String(this.panPhoto), this.panPhotoName || 'PAN_Card.jpg').subscribe({ error: (e) => console.error(e) });
          }
          if (this.aadhaarPhoto) {
            this.registrationService.uploadDocument(returnedRegId, 'AADHAAR', null, String(this.aadhaarPhoto), this.aadhaarPhotoName || 'Aadhaar_Card.jpg').subscribe({ error: (e) => console.error(e) });
          }
          if (this.pattadarDoc) {
            this.registrationService.uploadDocument(returnedRegId, 'LAND', null, String(this.pattadarDoc), this.pattadarDocName || 'Pattadar_Passbook_LPC.pdf').subscribe({ error: (e) => console.error(e) });
          }
        }

        // Parcels list seed
        const storedParcelsStr = localStorage.getItem(`userLandParcels_${currentMobile}`);
        let parcels: any[] = [];
        if (storedParcelsStr) {
          try {
            parcels = JSON.parse(storedParcelsStr);
          } catch (e) {
            parcels = [];
          }
        }
        
        const nameVal = `Cooperative Parcel ${this.surveyNo}/${this.subDivisionNo}`;
        
        const calculatorDetails = localStorage.getItem('SellerCalculatorDetails');
        let calcPondResults: any[] = [];
        if (calculatorDetails) {
          try {
            const parsedC = JSON.parse(calculatorDetails);
            if (Array.isArray(parsedC.pondResults) && parsedC.pondResults.length > 0) {
              calcPondResults = parsedC.pondResults;
            }
          } catch (e) {}
        }

        const basePonds = (this.ponds && this.ponds.length > 0)
          ? this.ponds
          : (calcPondResults.length > 0 ? calcPondResults : (this.plantationDataRaw?.ponds || []));

        const finalPondsList = basePonds.map((p: any, idx: number) => {
          const calcMatch = calcPondResults[idx] || {};
          const pArea = p.area || p.pondAreaHa || p.pondArea || calcMatch.area || calcMatch.pondAreaHa || 5.0;
          const pSpecies = p.species || p.subCategory || p.selectedSpecies || calcMatch.species || (idx === 0 ? 'IMC' : 'Pangasius');
          const pProd = p.production || p.totalProductionKg || p.biomassProductionKg || calcMatch.totalProduction || calcMatch.biomassProductionKg || (idx === 0 ? 37500 : (idx === 1 ? 85000 : 40000));
          const pCredits = p.credits || p.potentialCarbonCredits || p.carbonCredits || calcMatch.credits || calcMatch.co2Reduction || (idx === 0 ? 135.51 : (idx === 1 ? 183.08 : 100));

          return {
            id: p.id || `pond_${idx + 1}`,
            name: p.name || p.pondName || `Pond ${idx + 1}`,
            species: pSpecies,
            area: typeof pArea === 'number' ? `${pArea.toFixed(2)} Hectares` : String(pArea),
            production: typeof pProd === 'number' ? `${pProd.toLocaleString('en-IN')} Kg` : String(pProd).includes('Kg') ? String(pProd) : `${Number(pProd).toLocaleString('en-IN')} Kg`,
            credits: typeof pCredits === 'number' ? pCredits.toFixed(2) : String(pCredits),
            totalProductionKg: Number(pProd),
            carbonCredits: Number(pCredits)
          };
        });

        const totalProdSum = finalPondsList.reduce((sum: number, p: any) => sum + (Number(p.totalProductionKg) || 0), 0);
        const totalCreditsSum = finalPondsList.reduce((sum: number, p: any) => sum + (Number(p.carbonCredits) || 0), 0);
        const totProdVal = totalProdSum > 0 ? totalProdSum : 122500;
        const totCredVal = totalCreditsSum > 0 ? totalCreditsSum : (this.carbonCredits || 318.59);

        const registeredParcel: any = {
          id: 'parcel_' + Date.now(),
          registration_id: res?.data?.registrationId || ('reg_' + Date.now()),
          name: nameVal,
          surveyNo: this.surveyNo || '231',
          subDivisionNo: this.subDivisionNo || '2A',
          cropCategory: this.subCategory ? `${this.plantationType} (${this.subCategory})` : (this.plantationType || 'Aquaculture (Fish & Shrimp)'),
          area: `${this.plantationArea || 10.00} Hectares`,
          totalPondArea: `${this.plantationArea || 10.00} Hectares`,
          location: `${this.village || 'Agadalalanka'}, ${this.district || 'Andhra Pradesh'}`,
          trees: this.quantity || 120,
          status: 'Pending',
          auditor: 'Ecosystem Standards Board',
          date: new Date().toLocaleDateString('en-US'),
          totalProduction: `${totProdVal.toLocaleString('en-IN')} Kg`,
          total_production_kg: totProdVal,
          totalCarbonCredits: typeof totCredVal === 'number' ? totCredVal.toFixed(2) : totCredVal,
          sequestrationRate: typeof totCredVal === 'number' ? totCredVal.toFixed(2) : totCredVal,
          portfolioValue: Math.round(Number(totCredVal) * 120),
          docs: docsPayload,
          ponds: finalPondsList.length > 0 ? finalPondsList : [
            { id: 'pond_1', name: 'Pond 1', species: 'IMC', area: '5.00 Hectares', production: '37,500 Kg', credits: '135.51' },
            { id: 'pond_2', name: 'Pond 2', species: 'Pangasius', area: '5.00 Hectares', production: '85,000 Kg', credits: '183.08' }
          ],
          address: {
            pincode: this.pincode,
            state: this.state,
            district: this.district,
            mandal: this.mandal,
            village: this.village
          },
          survey: {
            surveyNo: this.surveyNo,
            subDivisionNo: this.subDivisionNo,
            area: this.landArea ? this.landArea.toString() : '10',
            unit: this.landUnit || 'Hectare'
          },
          plantation: {
            landType: this.landType,
            plantationType: this.plantationType,
            subCategory: this.subCategory,
            quantity: this.quantity,
            age: this.age,
            area: this.plantationArea,
            unit: this.plantationUnit,
            ...this.plantationDataRaw
          },
          latitude: this.latitude || (14.4450 + (Math.random() - 0.5) * 0.01),
          longitude: this.longitude || (79.9860 + (Math.random() - 0.5) * 0.01)
        };

        const exists = parcels.some(p => p.name === nameVal);
        if (!exists) {
          parcels.push(registeredParcel);
        }
        
        localStorage.setItem(`userLandParcels_${currentMobile}`, JSON.stringify(parcels));
        localStorage.setItem('userLandParcels', JSON.stringify(parcels));

        // Save active seller user account (No admin approval required for Seller/Buyer user account)
        const sellerUser = {
          user_id: 'usr_seller_' + Date.now(),
          displayName: this.fullName || 'Registered Seller',
          entity_name: this.fullName || 'Registered Seller',
          email: (this.emailAddress && this.emailAddress.trim()) ? this.emailAddress.trim() : `seller_${currentMobile.replace(/[^0-9]/g, '')}@cpay.in`,
          mobile_number: currentMobile,
          displayRole: 'Seller',
          role_name: 'SELLER',
          is_active: true,
          region: `${this.district || 'AP'}, India`,
          statusLabel: 'Active',
          created_at: new Date().toISOString()
        };

        try {
          const regUsersStr = localStorage.getItem('cpay_registered_users') || '[]';
          let regUsers: any[] = JSON.parse(regUsersStr);
          if (!regUsers.some(u => u.mobile_number === currentMobile)) {
            regUsers.unshift(sellerUser);
            localStorage.setItem('cpay_registered_users', JSON.stringify(regUsers));
          }
        } catch (e) {}

        // Push Auditor Queue token notification
        const queueStr = localStorage.getItem('cpay_valuator_queue') || '[]';
        let queue: any[] = [];
        try { queue = JSON.parse(queueStr); } catch (e) { queue = []; }
        const appNum = res.data?.applicationNumber || ('CPAY-2026-' + Math.floor(1000 + Math.random() * 9000));
        const tokenItem = {
          registration_id: res.data?.registrationId || ('reg_user_' + Date.now()),
          application_number: appNum,
          application_status: 'SUBMITTED',
          entity_name: `${this.fullName || 'Registered Seller'} (Seller)`,
          registration_type_name: 'Seller',
          user_type_name: 'Individual Landowner',
          mobile_number: currentMobile,
          email: (this.emailAddress && this.emailAddress.trim()) ? this.emailAddress.trim() : '',
          pincode: this.pincode || '500038',
          aadhaar_number: this.aadhaarNumber || '9845-1234-' + Math.floor(1000 + Math.random() * 9000),
          pan_number: this.panNumber || 'ABCDE' + Math.floor(1000 + Math.random() * 9000) + 'F',
          submitted_at: new Date().toISOString(),
          parcel_name: nameVal,
          parcel: registeredParcel,
          docs: docsPayload
        };
        const existsQueue = queue.some((q: any) => q.mobile_number === currentMobile && q.registration_type_name === 'Seller');
        if (!existsQueue) {
          queue.unshift(tokenItem);
        }
        localStorage.setItem('cpay_valuator_queue', JSON.stringify(queue));

        // Clear active wizard input fields so they are empty for the next run
        localStorage.removeItem('SellerPersonalDetails');
        localStorage.removeItem('SellerAddressDetails');
        localStorage.removeItem('SellerLandDetails');
        localStorage.removeItem('SellerPlantationDetails');
        localStorage.removeItem('SellerCalculation');
        localStorage.removeItem('SellerConsentDetails');
        localStorage.removeItem('SellerFurthestStep');
        localStorage.removeItem('selectedUserType');
        localStorage.removeItem('currentRegistrationId');

        this.router.navigate(['/login/seller-buyer']);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error('Unified submit failed', err);
        alert('Unified submit failed: ' + (err.error?.message || err.message));
      }
    });
  } 

  editPersonal(): void {
    this.router.navigate(['/personal-details']);
  }

  editAddress(): void {
    this.router.navigate(['/address-details']);
  }

  editLand(): void {
    this.router.navigate(['/land-survey-details']);
  }

  editPlantation(): void {
    this.router.navigate(['/plantation-details']);
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
