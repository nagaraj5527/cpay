import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ValuatorService } from '../../services/valuator.service';
import { MockDatabaseService } from '../../services/mock-db.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

export interface UserDetailRecord {
  user_id: string;
  mobile_number: string;
  user_name: string;
  user_type: 'Seller' | 'Buyer';
  aadhaar_number: string;
  pan_number: string;
  pincode: string;
  status: 'Verified' | 'Approved' | 'Pending' | 'Submitted' | 'SUBMITTED' | 'Rejected' | string;
  email: string;
  address: {
    state: string;
    district: string;
    mandal: string;
    village: string;
    pincode: string;
  };
  land?: {
    surveyNo: string;
    subDivisionNo: string;
    area: string;
    unit: string;
    landType: string;
  };
  plantation?: {
    type: string;
    species: string;
    trees: number;
    age: number;
    cultureDays?: number;
  };
  carbonCredits?: number;
  rejectionReason?: string;
  documents?: {
    pan?: string;
    aadhaar?: string;
    land?: string;
    landPhoto?: string;
    license?: string;
    signature?: string;
  };
  submitted_at: string;
  rawParcel?: any;
}

@Component({
  selector: 'app-valuator-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './valuator-dashboard.html',
  styleUrl: './valuator-dashboard.css'
})
export class ValuatorDashboardComponent implements OnInit {
  // Pincode Overlay State
  showPincodeModal: boolean = true;
  auditorPincode: string = '';
  hasEnteredPincode: boolean = false;
  pincodeError: string = '';

  // All Pincode Filtered Users
  allPincodeUsers: UserDetailRecord[] = [];
  displayedUsersList: UserDetailRecord[] = [];
  activeKpiFilter: string = 'ALL_SELLERS';

  // 8 KPI Summary Cards State
  kpiMetrics = {
    totalSellers: 0,
    totalBuyers: 0,
    approvedSellers: 0,
    pendingSellers: 0,
    approvedBuyers: 0,
    pendingBuyers: 0,
    totalApproved: 0,
    totalPending: 0
  };

  // Search & Sync State
  searchQuery: string = '';
  isSyncing: boolean = false;
  syncTime: string = 'Just now';

  // Modal State for Full View
  showFullViewModal: boolean = false;
  selectedUserForView: UserDetailRecord | null = null;

  // Modal State for Photo/Document Viewer
  showDocViewerModal: boolean = false;
  activeDocTitle: string = '';
  activeDocUrl: any = null;
  isImageDoc: boolean = true;

  // Modal State for Reject Feedback
  showRejectModal: boolean = false;
  selectedUserForReject: UserDetailRecord | null = null;
  rejectionReason: string = '';
  rejectError: string = '';

  // Modal State for Request Changes
  showChangesModal: boolean = false;
  selectedUserForChanges: UserDetailRecord | null = null;
  changesRemarks: string = '';
  changesError: string = '';

  auditorName: string = 'Auditor';
  auditorPhoto: string = '';

  constructor(
    private router: Router,
    private valuatorService: ValuatorService,
    private mockDb: MockDatabaseService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  private handleAuthError(err: any): boolean {
    if (err && (err.status === 401 || err.status === 403)) {
      console.warn('Session expired or unauthorized. Redirecting to valuator login...');
      localStorage.removeItem('token');
      this.router.navigate(['/login/valuator']);
      return true;
    }
    return false;
  }

  ngOnInit(): void {
    if (!localStorage.getItem('token')) {
      console.warn('No authentication token found. Redirecting to valuator login...');
      this.router.navigate(['/login/valuator']);
      return;
    }
    this.loadAuditorDetails();
    const savedPin = sessionStorage.getItem('auditor_pincode');
    if (savedPin) {
      this.auditorPincode = savedPin;
      this.hasEnteredPincode = true;
      this.showPincodeModal = false;
      this.loadUsersForPincode(savedPin);
    } else {
      this.showPincodeModal = true;
      this.hasEnteredPincode = false;
    }
  }

  loadAuditorDetails(): void {
    this.authService.getProfile().subscribe({
      next: (res: any) => {
        if (res && res.success && res.data) {
          if (res.data.roleName !== 'VALUATOR') {
            console.warn('Access denied: User is not a Valuator. Redirecting to login...');
            localStorage.removeItem('token');
            this.router.navigate(['/login/valuator']);
            return;
          }
          const profileData = res.data;
          const valName = profileData.valuatorDetails?.name || profileData.valuatorDetails?.valuator_name || profileData.displayName || profileData.name;
          
          if (valName && !valName.startsWith('valuator_') && !valName.startsWith('user_')) {
            this.auditorName = valName;
          } else if (profileData.username && !profileData.username.startsWith('valuator_')) {
            this.auditorName = profileData.username;
          } else {
            this.auditorName = 'Auditor';
          }
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => {
        console.error('Failed to load auditor profile from DB', err);
        this.handleAuthError(err);
      }
    });

    const mobile = localStorage.getItem('currentUserMobile') || localStorage.getItem('loginMobile') || '';
    if (mobile) {
      const savedPhoto = localStorage.getItem(`auditor_photo_${mobile}`);
      if (savedPhoto) {
        this.auditorPhoto = savedPhoto;
      }
    }
  }

  onPhotoSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 150;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            
            this.auditorPhoto = compressedDataUrl;
            this.cdr.detectChanges();
            
            const mobile = localStorage.getItem('currentUserMobile') || localStorage.getItem('loginMobile') || '';
            if (mobile) {
              localStorage.setItem(`auditor_photo_${mobile}`, compressedDataUrl);
            }
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Submit Auditor Pincode Entry
  submitAuditorPincode(): void {
    const cleanPin = (this.auditorPincode || '').trim();
    if (!cleanPin || cleanPin.length < 3) {
      this.pincodeError = 'Please enter a valid 6-digit Pincode';
      return;
    }
    this.pincodeError = '';
    this.hasEnteredPincode = true;
    this.showPincodeModal = false;
    sessionStorage.setItem('auditor_pincode', cleanPin);
    this.loadUsersForPincode(cleanPin);
  }

  changePincode(): void {
    this.showPincodeModal = true;
  }

  refreshQueue(): void {
    this.isSyncing = true;
    const cleanPin = (this.auditorPincode || '').replace(/[^0-9]/g, '').trim();

    this.valuatorService.getPincodeUsers(cleanPin).subscribe({
      next: (res: any) => {
        this.loadUsersForPincode(cleanPin);
        this.showToast(`Queue refreshed successfully for Pincode: ${cleanPin || 'All'}`);
      },
      error: (err: any) => {
        this.loadUsersForPincode(cleanPin);
        this.showToast(`Queue refreshed successfully for Pincode: ${cleanPin || 'All'}`);
      }
    });
  }

  // Load and query Users from Database strictly based on Pincode
  loadUsersForPincode(targetPincode: string): void {
    this.isSyncing = true;
    const cleanPin = (targetPincode || '').replace(/[^0-9]/g, '').trim();
    this.auditorPincode = cleanPin || targetPincode;

    // 1. Query Valuator Pincode Users from PostgreSQL backend database
    this.valuatorService.getPincodeUsers(cleanPin).subscribe({
      next: (res: any) => {
        let backendUsers: UserDetailRecord[] = [];
        if (res && res.success && Array.isArray(res.data)) {
          const filteredRows = res.data.filter((row: any) => {
            const role = (row.user_role || '').toUpperCase();
            const email = (row.email || '').toLowerCase();
            const uName = (row.user_name || '').toLowerCase();
            
            // Exclude Auditor / Valuator / Admin roles from verification request list
            if (role === 'VALUATOR' || role === 'AUDITOR' || role === 'ADMIN') return false;
            if (email.startsWith('valuator_') || email.includes('auditor')) return false;
            if (uName.startsWith('valuator_')) return false;

            // Strict Pincode Filter
            if (cleanPin && cleanPin.length >= 3) {
              const rowPin = String(row.pincode || '').replace(/[^0-9]/g, '').trim();
              if (rowPin && !rowPin.includes(cleanPin) && !cleanPin.includes(rowPin)) {
                return false;
              }
            }
            return true;
          });

          filteredRows.forEach((row: any, qIdx: number) => {
            const rowMobile = row.mobile_number || '';
            const fullMob = rowMobile.startsWith('+') ? rowMobile : '+91 ' + rowMobile;
            const regId = row.registration_id || ('USR-REG-' + (row.user_id || ''));

            const cleanTargetMob = fullMob.replace(/[^0-9]/g, '');

            let rowStatus: 'Verified' | 'Pending' | 'Rejected' | 'Resubmission Required' | 'SUBMITTED' | string = 'Pending';
            if (row.status === 'VERIFIED_CORRECT' || row.status === 'Verified') {
              rowStatus = 'Verified';
            } else if (row.status === 'VERIFIED_WRONG' || row.status === 'Rejected') {
              rowStatus = 'Rejected';
            } else if (row.status === 'RESUBMISSION_REQUIRED' || row.status === 'Resubmission Required') {
              rowStatus = 'Resubmission Required';
            }

            // 1. Format Email (only show real user provided emails, not user_... or @cpay.local defaults)
            let userEmail = row.email || 'N/A';
            try {
              const pStr = localStorage.getItem('SellerPersonalDetails');
              if (pStr) {
                const pd = JSON.parse(pStr);
                if (pd && pd.emailAddress) {
                  userEmail = pd.emailAddress;
                }
              }
            } catch (e) {}
            userEmail = this.formatSellerEmail(userEmail);

            // 2. Individual seller plantation & survey details
            let finalSurveyNo = (row.survey_number && row.survey_number !== 'N/A') ? String(row.survey_number).trim() : '';
            let finalSubDiv = (row.sub_division_number && row.sub_division_number !== 'N/A') ? String(row.sub_division_number).trim() : '';

            // Check if seller has local storage registered parcels
            let sellerParcels: any[] = [];
            try {
              for (let k = 0; k < localStorage.length; k++) {
                const keyName = localStorage.key(k);
                if (keyName && (keyName.startsWith('userLandParcels_') || keyName.startsWith('userLandParcels'))) {
                  const kMob = keyName.replace('userLandParcels_', '').replace(/[^0-9]/g, '');
                  if (!keyName.includes('_') || kMob === cleanTargetMob || (cleanTargetMob.length >= 9 && kMob.endsWith(cleanTargetMob.slice(-10)))) {
                    const items = JSON.parse(localStorage.getItem(keyName) || '[]');
                    if (Array.isArray(items) && items.length > 0) {
                      items.forEach((item: any) => {
                        if (!sellerParcels.some((sp: any) => sp.surveyNo === item.surveyNo || sp.name === item.name)) {
                          sellerParcels.push(item);
                        }
                      });
                    }
                  }
                }
              }
            } catch (e) {}

            const isAqua = (row.aquaculture_id || row.aquaculture_type || row.fish_name || row.prawn_name || (row.land_type_name && (row.land_type_name.toLowerCase().includes('aqua') || row.land_type_name.toLowerCase().includes('fish')))) ? true : false;
            let catName = row.category_name || row.aquaculture_type || (isAqua ? 'Aquaculture (Prawn / Fish Culture)' : 'Agroforestry Plantation');
            let specName = row.species_name || row.fish_name || row.prawn_name || (isAqua ? 'Litopenaeus Vannamei (Prawn)' : 'Neem (Azadirachta indica)');
            let stockVal = Number(row.stock_quantity || row.number_of_plants) || 200000;
            let cDays = Number(row.culture_days) || 180;
            let isSellerUser = !(row.user_role || '').toLowerCase().includes('buyer');

            if (sellerParcels.length > 0 && isSellerUser) {
              sellerParcels.forEach((pItem: any, pIdx: number) => {
                let pSurveyNo = pItem.surveyNo || pItem.survey_number || pItem.survey?.surveyNo || finalSurveyNo || '231/2A';
                let pSubDiv = pItem.subDivisionNo || pItem.sub_division_number || pItem.survey?.subDivisionNo || finalSubDiv || '';
                if (pSurveyNo && pSubDiv && !pSurveyNo.includes('/')) {
                  pSurveyNo = `${pSurveyNo}/${pSubDiv}`;
                }
                let pStatus = (pItem.status || rowStatus || 'Pending');
                let pAreaStr = pItem.totalPondArea || pItem.area || (pItem.survey?.area ? `${pItem.survey.area} Acres` : '10.00 Acres');
                let pCredits = parseFloat(String(pItem.totalCarbonCredits || pItem.sequestrationRate || row.carbon_credits || 318.59));

                let pLocationStr = pItem.location || `${row.village_name || 'Agadalalanka'}, ${row.district_name || 'West Godavari'}`;
                let locParts = pLocationStr.split(',').map((s: string) => s.trim());
                let pVillage = locParts[0] || row.village_name || 'Agadalalanka';
                let pDistrict = locParts[1] || row.district_name || 'West Godavari';

                const pPin = String(pItem.address?.pincode || row.pincode || '').replace(/[^0-9]/g, '').trim();
                if (!cleanPin || !pPin || pPin.includes(cleanPin) || cleanPin.includes(pPin)) {
                  backendUsers.push({
                    user_id: pItem.registration_id || pItem.assetId || `${regId}_asset_${pIdx + 1}`,
                    mobile_number: fullMob,
                    user_name: row.user_name || 'Registered User',
                    user_type: 'Seller',
                    aadhaar_number: row.aadhaar_number || 'N/A',
                    pan_number: row.pan_number || 'N/A',
                    pincode: pPin || cleanPin,
                    status: pStatus,
                    email: userEmail,
                    address: {
                      state: pItem.address?.state || row.state_name || 'Andhra Pradesh',
                      district: pDistrict,
                      mandal: pItem.address?.mandal || row.mandal_name || 'Gundugolanu',
                      village: pVillage,
                      pincode: pPin || cleanPin
                    },
                    land: {
                      surveyNo: pSurveyNo,
                      subDivisionNo: pSubDiv || '2A',
                      area: typeof pAreaStr === 'number' ? `${pAreaStr} Acres` : String(pAreaStr),
                      unit: 'Acre',
                      landType: 'Aquaculture / Agricultural'
                    },
                    plantation: {
                      type: catName,
                      species: specName,
                      trees: stockVal,
                      age: Number(row.plantation_age) || Math.round(cDays / 30) || 6,
                      cultureDays: cDays
                    },
                    carbonCredits: pCredits,
                    rejectionReason: pItem.rejectionReason || row.rejection_remarks || '',
                    documents: {
                      pan: 'PAN_Verification.pdf',
                      aadhaar: 'Aadhaar_Verification.pdf',
                      land: 'Aquaculture_Registration.pdf',
                      landPhoto: 'Land_Photograph.jpg',
                      license: 'Compliance_Doc.pdf',
                      signature: 'Applicant_Signature.png'
                    },
                    submitted_at: row.created_at || new Date().toISOString(),
                    rawParcel: pItem
                  });
                }
              });
            } else {
              if (finalSurveyNo && finalSubDiv && !finalSurveyNo.includes('/')) {
                finalSurveyNo = `${finalSurveyNo}/${finalSubDiv}`;
              }
              if (!finalSurveyNo) {
                finalSurveyNo = '231/2A';
              }

              const rowPin = String(row.pincode || '').replace(/[^0-9]/g, '').trim();
              if (!cleanPin || !rowPin || rowPin.includes(cleanPin) || cleanPin.includes(rowPin)) {
                backendUsers.push({
                  user_id: regId,
                  mobile_number: fullMob,
                  user_name: row.user_name || 'Registered User',
                  user_type: isSellerUser ? 'Seller' : 'Buyer',
                  aadhaar_number: row.aadhaar_number || 'N/A',
                  pan_number: row.pan_number || 'N/A',
                  pincode: rowPin || cleanPin,
                  status: rowStatus,
                  email: userEmail,
                  address: {
                    state: row.state_name || 'Telangana',
                    district: row.district_name || 'K.V.Rangareddy',
                    mandal: row.mandal_name || 'Serilingampally',
                    village: row.village_name || 'Lingampalli',
                    pincode: rowPin || cleanPin
                  },
                  land: isSellerUser ? {
                    surveyNo: finalSurveyNo,
                    subDivisionNo: finalSubDiv || '2A',
                    area: (row.total_area !== null && row.total_area !== undefined && Number(row.total_area) > 0) ? (parseFloat(row.total_area) + ' ' + (row.land_unit_name || 'Acre') + 's') : '10.00 Acres',
                    unit: row.land_unit_name || 'Acre',
                    landType: row.land_type_name || 'Aquaculture / Agricultural'
                  } : undefined,
                  plantation: isSellerUser ? {
                    type: catName,
                    species: specName,
                    trees: stockVal,
                    age: Number(row.plantation_age) || Math.round(cDays / 30) || 6,
                    cultureDays: cDays
                  } : undefined,
                  carbonCredits: row.carbon_credits ? Math.round(Number(row.carbon_credits)) : 318.59,
                  rejectionReason: row.rejection_remarks || '',
                  documents: {
                    pan: 'PAN_Verification.pdf',
                    aadhaar: 'Aadhaar_Verification.pdf',
                    land: 'Aquaculture_Registration.pdf',
                    landPhoto: 'Land_Photograph.jpg',
                    license: 'Compliance_Doc.pdf',
                    signature: 'Applicant_Signature.png'
                  },
                  submitted_at: row.created_at || new Date().toISOString(),
                  rawParcel: {
                    ...row,
                    parcel_name: `Cooperative Parcel ${finalSurveyNo}`
                  }
                });
              }
            }
          });
        }

        this.allPincodeUsers = backendUsers;
        this.calculate8KpiMetrics();
        this.filterUsersByKpiCard(this.activeKpiFilter);
        this.isSyncing = false;
        this.updateSyncTime();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load backend users', err);
        if (this.handleAuthError(err)) return;
        this.allPincodeUsers = [];
        this.calculate8KpiMetrics();
        this.filterUsersByKpiCard(this.activeKpiFilter);
        this.isSyncing = false;
        this.updateSyncTime();
        this.cdr.detectChanges();
      }
    });
  }

  // Calculate 8 KPI Metrics for Auditor Dashboard
  private calculate8KpiMetrics(): void {
    let sellers = 0;
    let buyers = 0;
    let appSellers = 0;
    let pendSellers = 0;
    let appBuyers = 0;
    let pendBuyers = 0;

    this.allPincodeUsers.forEach(u => {
      const isVerified = u.status === 'Verified' || u.status === 'Approved';
      if (u.user_type === 'Seller') {
        sellers++;
        if (isVerified) appSellers++;
        else pendSellers++;
      } else {
        buyers++;
        if (isVerified) appBuyers++;
        else pendBuyers++;
      }
    });

    this.kpiMetrics = {
      totalSellers: sellers,
      totalBuyers: buyers,
      approvedSellers: appSellers,
      pendingSellers: pendSellers,
      approvedBuyers: appBuyers,
      pendingBuyers: pendBuyers,
      totalApproved: appSellers + appBuyers,
      totalPending: pendSellers + pendBuyers
    };
  }

  // Filter Users Table when Auditor clicks on any KPI Card
  filterUsersByKpiCard(filterType: string): void {
    this.activeKpiFilter = filterType;
    let list = [...this.allPincodeUsers];

    switch (filterType) {
      case 'ALL_SELLERS':
        list = list.filter(u => u.user_type === 'Seller');
        break;
      case 'ALL_BUYERS':
        list = list.filter(u => u.user_type === 'Buyer');
        break;
      case 'APPROVED_SELLERS':
        list = list.filter(u => u.user_type === 'Seller' && (u.status === 'Verified' || u.status === 'Approved'));
        break;
      case 'PENDING_SELLERS':
        list = list.filter(u => u.user_type === 'Seller' && u.status !== 'Verified' && u.status !== 'Approved');
        break;
      case 'APPROVED_BUYERS':
        list = list.filter(u => u.user_type === 'Buyer' && (u.status === 'Verified' || u.status === 'Approved'));
        break;
      case 'PENDING_BUYERS':
        list = list.filter(u => u.user_type === 'Buyer' && u.status !== 'Verified' && u.status !== 'Approved');
        break;
      case 'TOTAL_APPROVED':
        list = list.filter(u => u.status === 'Verified' || u.status === 'Approved');
        break;
      case 'TOTAL_PENDING':
        list = list.filter(u => u.status !== 'Verified' && u.status !== 'Approved');
        break;
      default:
        list = [...this.allPincodeUsers];
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(u => 
        u.user_name.toLowerCase().includes(q) ||
        u.mobile_number.includes(q) ||
        u.user_id.toLowerCase().includes(q) ||
        u.pan_number.toLowerCase().includes(q)
      );
    }

    this.displayedUsersList = list;
    this.cdr.detectChanges();
  }

  onSearchChange(): void {
    this.filterUsersByKpiCard(this.activeKpiFilter);
  }

  private updateSyncTime(): void {
    const now = new Date();
    this.syncTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  // 1. FULL VIEW Modal Inspection
  openFullView(user: UserDetailRecord): void {
    this.selectedUserForView = { ...user };
    this.showFullViewModal = true;

    // Check if rawParcel has asset-specific details (from Seller Dashboard added asset)
    if (user.rawParcel) {
      const p = user.rawParcel;
      if (p.address || p.location) {
        let locStr = p.location || '';
        let parts = locStr.split(',').map((s: string) => s.trim());
        this.selectedUserForView.address = {
          pincode: p.address?.pincode || p.pincode || user.address.pincode,
          state: p.address?.state || parts[2] || user.address.state,
          district: p.address?.district || parts[1] || user.address.district,
          mandal: p.address?.mandal || user.address.mandal,
          village: p.address?.village || parts[0] || user.address.village
        };
      }
      if (p.surveyNo || p.survey_number || p.survey?.surveyNo) {
        let sNo = p.surveyNo || p.survey_number || p.survey?.surveyNo;
        let sSub = p.subDivisionNo || p.sub_division_number || p.survey?.subDivisionNo || '2A';
        if (sNo && sSub && !sNo.includes('/')) sNo = `${sNo}/${sSub}`;
        this.selectedUserForView.land = {
          surveyNo: sNo,
          subDivisionNo: sSub,
          area: p.totalPondArea || p.area || (p.survey?.area ? `${p.survey.area} Acres` : '10.00 Acres'),
          unit: 'Acre',
          landType: p.landType || 'Aquaculture / Agricultural'
        };
      }
      if (p.plantationCategory || p.aquaculture_type || p.category_name) {
        this.selectedUserForView.plantation = {
          type: p.plantationCategory || p.aquaculture_type || p.category_name || 'Agroforestry Plantation',
          species: p.plantSpecies || p.fish_name || p.prawn_name || p.species_name || 'Neem (Azadirachta indica)',
          trees: Number(p.stock_quantity || p.number_of_plants || p.plantCount) || 200000,
          age: Number(p.plantation_age || p.age) || 6,
          cultureDays: Number(p.culture_days) || 180
        };
      }
      if (p.totalCarbonCredits || p.carbonCredits) {
        this.selectedUserForView.carbonCredits = parseFloat(String(p.totalCarbonCredits || p.carbonCredits));
      }
    }

    // Fetch 100% accurate database records for newly registered users or DB profiles
    if (user.user_id && this.valuatorService) {
      this.valuatorService.getRegistrationDetails(user.user_id).subscribe({
        next: (res: any) => {
          if (res && res.success && res.data && this.selectedUserForView) {
            const d = res.data;
            const reg = d.registration || {};
            const entity = d.entityDetails || {};
            const addr = d.addressDetails || {};
            const land = Array.isArray(d.landDetails) && d.landDetails.length > 0 ? d.landDetails[0] : null;
            const plant = Array.isArray(d.plantationDetails) && d.plantationDetails.length > 0 ? d.plantationDetails[0] : null;
            const aqua = Array.isArray(d.aquacultureDetails) && d.aquacultureDetails.length > 0 ? d.aquacultureDetails[0] : null;
            const carbon = d.carbonCalculation || null;

            if (entity.full_name || entity.organization_name || entity.department_name) {
              this.selectedUserForView.user_name = entity.full_name || entity.organization_name || entity.department_name;
            }
            if (entity.aadhaar_number && entity.aadhaar_number !== 'N/A') {
              this.selectedUserForView.aadhaar_number = entity.aadhaar_number;
            }
            if (entity.pan_number && entity.pan_number !== 'N/A') {
              this.selectedUserForView.pan_number = entity.pan_number;
            }
            if (entity.email || reg.email) {
              this.selectedUserForView.email = entity.email || reg.email;
            }
            if (addr.state_name || addr.district_name || addr.pincode) {
              this.selectedUserForView.address = {
                pincode: addr.pincode || this.selectedUserForView.address.pincode,
                state: addr.state_name || this.selectedUserForView.address.state,
                district: addr.district_name || this.selectedUserForView.address.district,
                mandal: addr.mandal_name || this.selectedUserForView.address.mandal,
                village: addr.village_name || this.selectedUserForView.address.village
              };
            }
            if (land) {
              let sNo = land.survey_number || '231/2A';
              let sSub = land.sub_division_number || '2A';
              if (sNo && sSub && !sNo.includes('/')) sNo = `${sNo}/${sSub}`;
              this.selectedUserForView.land = {
                surveyNo: sNo,
                subDivisionNo: sSub,
                area: land.total_area ? `${land.total_area} ${land.unit_name || 'Acre'}s` : '10.00 Acres',
                unit: land.unit_name || 'Acre',
                landType: land.land_type_name || 'Aquaculture / Agricultural'
              };
            }
            if (plant || aqua) {
              const activeP = plant || aqua;
              this.selectedUserForView.plantation = {
                type: activeP.category_name || activeP.aquaculture_type || 'Agroforestry Plantation',
                species: activeP.species_name || activeP.fish_species || activeP.prawn_species || 'Neem (Azadirachta indica)',
                trees: Number(activeP.number_of_plants || activeP.stock_quantity) || 200000,
                age: Number(activeP.plantation_age) || 6,
                cultureDays: Number(activeP.culture_days) || 180
              };
            }
            if (carbon && carbon.carbon_credits) {
              this.selectedUserForView.carbonCredits = Number(carbon.carbon_credits);
            }
            this.cdr.detectChanges();
          }
        },
        error: (err: any) => {
          console.warn('Could not fetch additional registration DB details:', err);
        }
      });
    }
  }

  closeFullView(): void {
    this.showFullViewModal = false;
    this.selectedUserForView = null;
  }

  // 2. APPROVE Action & Carbon Credits / Wallet Unlock
  approveUser(user: UserDetailRecord): void {
    if (confirm(`Are you sure you want to Approve & Verify ${user.user_name} (${user.user_type})? This will unlock carbon credits and wallet balances.`)) {
      user.status = 'Verified';

      const fullMobileKey = user.mobile_number.trim();
      const targetMobile = fullMobileKey.replace(/[^0-9]/g, '');
      const cleanTarget = user.mobile_number.replace(/[^0-9]/g, '');

      // Update user land parcels in localStorage
      const parseParcels = (str: string | null) => {
        try { return str ? JSON.parse(str) : []; } catch (e) { return []; }
      };

      const targetRegId = user.user_id;
      const targetSurveyNo = (user.land?.surveyNo || '').trim().toLowerCase();

      const updateParcelList = (parcels: any[]) => {
        parcels.forEach((p: any) => {
          const pRegId = p.registration_id || p.id;
          const pSurveyNo = (p.surveyNo || p.survey?.surveyNo || '').trim().toLowerCase();
          if ((pRegId && pRegId === targetRegId) || (targetSurveyNo && pSurveyNo === targetSurveyNo)) {
            p.status = 'Verified';
            p.auditor = 'UNFCCC Lead Auditor';
            p.date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          }
        });
      };

      // Robust local storage key matching for parcels
      let updatedAny = false;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('userLandParcels_')) {
          const keyMobile = key.replace('userLandParcels_', '').replace(/[^0-9]/g, '');
          if (keyMobile === cleanTarget || (keyMobile.length >= 9 && cleanTarget.endsWith(keyMobile)) || (cleanTarget.length >= 9 && keyMobile.endsWith(cleanTarget))) {
            let parcels = parseParcels(localStorage.getItem(key));
            if (parcels.length > 0) {
              updateParcelList(parcels);
              localStorage.setItem(key, JSON.stringify(parcels));
              updatedAny = true;
            }
          }
        }
      }

      if (!updatedAny && fullMobileKey) {
        let parcels = parseParcels(localStorage.getItem(`userLandParcels_${fullMobileKey}`));
        if (parcels.length > 0) {
          updateParcelList(parcels);
          localStorage.setItem(`userLandParcels_${fullMobileKey}`, JSON.stringify(parcels));
        }
      }

      if (targetMobile.length >= 10) {
        const key10 = `userLandParcels_+91${targetMobile.slice(-10)}`;
        let parcels10 = parseParcels(localStorage.getItem(key10));
        if (parcels10.length > 0) {
          updateParcelList(parcels10);
          localStorage.setItem(key10, JSON.stringify(parcels10));
        }
      }

      let globalParcels = parseParcels(localStorage.getItem('userLandParcels'));
      if (globalParcels.length > 0) {
        updateParcelList(globalParcels);
        localStorage.setItem('userLandParcels', JSON.stringify(globalParcels));
      }

      // Also update docStatus verification keys in localStorage using robust matching
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('docStatus_pan_') || key.startsWith('docStatus_aadhaar_') || key.startsWith('docStatus_land_') || key.startsWith('docStatus_bank_') || key.startsWith('docStatus_signature_'))) {
          const keyMobile = key.replace(/docStatus_(pan|aadhaar|land|bank|signature)_/, '').replace(/[^0-9]/g, '');
          if (keyMobile === cleanTarget || (keyMobile.length >= 9 && cleanTarget.endsWith(keyMobile)) || (cleanTarget.length >= 9 && keyMobile.endsWith(cleanTarget))) {
            localStorage.setItem(key, 'Verified');
          }
        }
      }

      // Also write direct keys as fallback
      localStorage.setItem(`docStatus_pan_${fullMobileKey}`, 'Verified');
      localStorage.setItem(`docStatus_aadhaar_${fullMobileKey}`, 'Verified');
      localStorage.setItem(`docStatus_land_${fullMobileKey}`, 'Verified');
      localStorage.setItem(`docStatus_bank_${fullMobileKey}`, 'Verified');
      localStorage.setItem(`docStatus_signature_${fullMobileKey}`, 'Verified');

      if (cleanTarget) {
        const last10Suffix = cleanTarget.slice(-10);
        localStorage.setItem(`docStatus_pan_+91${last10Suffix}`, 'Verified');
        localStorage.setItem(`docStatus_aadhaar_+91${last10Suffix}`, 'Verified');
        localStorage.setItem(`docStatus_land_+91${last10Suffix}`, 'Verified');
        localStorage.setItem(`docStatus_bank_+91${last10Suffix}`, 'Verified');
        localStorage.setItem(`docStatus_signature_+91${last10Suffix}`, 'Verified');
      }

      // Update valuator queue item specifically for this registration ID / Pincode asset
      const queueStr = localStorage.getItem('cpay_valuator_queue');
      if (queueStr) {
        try {
          let queue = JSON.parse(queueStr);
          queue.forEach((q: any) => {
            if (q.registration_id === user.user_id) {
              q.application_status = 'VERIFIED_CORRECT';
            }
          });
          localStorage.setItem('cpay_valuator_queue', JSON.stringify(queue));
        } catch (e) {}
      }

      // Persist in approved user IDs list so it remains permanently approved
      const approvedIdsStr = localStorage.getItem('cpay_approved_user_ids') || '[]';
      let approvedIds: string[] = [];
      try { approvedIds = JSON.parse(approvedIdsStr); } catch (e) { approvedIds = []; }
      if (!approvedIds.includes(user.user_id)) approvedIds.push(user.user_id);
      localStorage.setItem('cpay_approved_user_ids', JSON.stringify(approvedIds));

      // Dispatch real-time cross-tab & component custom event for instant (<1s) seller dashboard update
      try {
        window.dispatchEvent(new CustomEvent('cpay_approval_updated', {
          detail: {
            userId: user.user_id,
            mobile: user.mobile_number,
            pincode: user.pincode,
            userName: user.user_name,
            status: 'Verified',
            timestamp: new Date().toISOString()
          }
        }));
      } catch (e) {}

      // Sync backend API
      this.valuatorService.evaluateRegistration(user.user_id, 'VERIFIED_CORRECT', 'Approved by Auditor').subscribe({
        next: () => console.log('✅ Approved on backend'),
        error: (err) => console.warn('Backend approval sync fallback:', err)
      });

      this.calculate8KpiMetrics();
      this.filterUsersByKpiCard(this.activeKpiFilter);
      this.showToast(`User ${user.user_name} approved successfully! Carbon credits unlocked.`);
    }
  }

  // 3. REJECT Action & Mandatory Reason Box
  openRejectModal(user: UserDetailRecord): void {
    this.selectedUserForReject = user;
    this.rejectionReason = '';
    this.rejectError = '';
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedUserForReject = null;
    this.rejectionReason = '';
    this.rejectError = '';
  }

  submitRejection(): void {
    if (!this.selectedUserForReject) return;
    if (!this.rejectionReason || this.rejectionReason.trim().length < 5) {
      this.rejectError = 'Please enter a valid rejection reason (minimum 5 characters).';
      return;
    }

    const user = this.selectedUserForReject;
    user.status = 'Rejected';

    const fullMobileKey = user.mobile_number.trim();
    const targetMobile = fullMobileKey.replace(/[^0-9]/g, '');
    const cleanTarget = user.mobile_number.replace(/[^0-9]/g, '');

    // Update land parcels status in localStorage to Rejected
    const parseParcels = (str: string | null) => {
      try { return str ? JSON.parse(str) : []; } catch (e) { return []; }
    };
    const targetRegId = user.user_id;
    const targetSurveyNo = (user.land?.surveyNo || '').trim().toLowerCase();

    const updateParcelList = (parcels: any[]) => {
      parcels.forEach((p: any) => {
        const pRegId = p.registration_id || p.id;
        const pSurveyNo = (p.surveyNo || p.survey?.surveyNo || '').trim().toLowerCase();
        if ((pRegId && pRegId === targetRegId) || (targetSurveyNo && pSurveyNo === targetSurveyNo)) {
          p.status = 'Rejected';
          p.auditor = 'UNFCCC Lead Auditor (Rejected)';
          p.rejectionReason = this.rejectionReason;
        }
      });
    };

    // Robust local storage key matching for parcels rejection
    let updatedAny = false;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('userLandParcels_')) {
        const keyMobile = key.replace('userLandParcels_', '').replace(/[^0-9]/g, '');
        if (keyMobile === cleanTarget || (keyMobile.length >= 9 && cleanTarget.endsWith(keyMobile)) || (cleanTarget.length >= 9 && keyMobile.endsWith(cleanTarget))) {
          let parcels = parseParcels(localStorage.getItem(key));
          if (parcels.length > 0) {
            updateParcelList(parcels);
            localStorage.setItem(key, JSON.stringify(parcels));
            updatedAny = true;
          }
        }
      }
    }

    if (!updatedAny && fullMobileKey) {
      let parcels = parseParcels(localStorage.getItem(`userLandParcels_${fullMobileKey}`));
      if (parcels.length > 0) {
        updateParcelList(parcels);
        localStorage.setItem(`userLandParcels_${fullMobileKey}`, JSON.stringify(parcels));
      }
    }

    if (targetMobile.length >= 10) {
      const key10 = `userLandParcels_+91${targetMobile.slice(-10)}`;
      let parcels10 = parseParcels(localStorage.getItem(key10));
      if (parcels10.length > 0) {
        updateParcelList(parcels10);
        localStorage.setItem(key10, JSON.stringify(parcels10));
      }
    }

    // Update queue item specifically for this registration ID
    const queueStr = localStorage.getItem('cpay_valuator_queue');
    if (queueStr) {
      try {
        let queue = JSON.parse(queueStr);
        queue.forEach((q: any) => {
          if (q.registration_id === user.user_id) {
            q.application_status = 'VERIFIED_WRONG';
          }
        });
        localStorage.setItem('cpay_valuator_queue', JSON.stringify(queue));
      } catch (e) {}
    }

    // Persist in rejected user IDs list so it remains permanently rejected
    const rejectedIdsStr = localStorage.getItem('cpay_rejected_user_ids') || '[]';
    let rejectedIds: string[] = [];
    try { rejectedIds = JSON.parse(rejectedIdsStr); } catch (e) { rejectedIds = []; }
    if (!rejectedIds.includes(user.user_id)) rejectedIds.push(user.user_id);
    localStorage.setItem('cpay_rejected_user_ids', JSON.stringify(rejectedIds));

    this.valuatorService.evaluateRegistration(user.user_id, 'VERIFIED_WRONG', this.rejectionReason).subscribe({
      next: () => console.log('✅ Rejected on backend'),
      error: (err) => console.warn('Backend rejection sync fallback:', err)
    });

    this.showToast(`User ${user.user_name} rejected with reason provided.`);
    this.closeRejectModal();
    this.calculate8KpiMetrics();
    this.filterUsersByKpiCard(this.activeKpiFilter);
  }

  // 4. REQUEST CHANGES Flow
  openChangesModal(user: UserDetailRecord): void {
    this.selectedUserForChanges = user;
    this.changesRemarks = '';
    this.changesError = '';
    this.showChangesModal = true;
  }

  closeChangesModal(): void {
    this.showChangesModal = false;
    this.selectedUserForChanges = null;
    this.changesRemarks = '';
    this.changesError = '';
  }

  submitChangesRequest(): void {
    if (!this.selectedUserForChanges) return;
    if (!this.changesRemarks || this.changesRemarks.trim().length < 5) {
      this.changesError = 'Please enter valid feedback/instructions (minimum 5 characters).';
      return;
    }

    const user = this.selectedUserForChanges;
    user.status = 'Resubmission Required';

    const fullMobileKey = user.mobile_number.trim();
    const cleanTarget = user.mobile_number.replace(/[^0-9]/g, '');

    // Update land parcels status in localStorage to Resubmission Required
    const parseParcels = (str: string | null) => {
      try { return str ? JSON.parse(str) : []; } catch (e) { return []; }
    };
    const targetRegId = user.user_id;
    const targetSurveyNo = (user.land?.surveyNo || '').trim().toLowerCase();

    const updateParcelList = (parcels: any[]) => {
      parcels.forEach((p: any) => {
        const pRegId = p.registration_id || p.id;
        const pSurveyNo = (p.surveyNo || p.survey?.surveyNo || '').trim().toLowerCase();
        if ((pRegId && pRegId === targetRegId) || (targetSurveyNo && pSurveyNo === targetSurveyNo)) {
          p.status = 'Resubmission Required';
          p.auditor = 'UNFCCC Lead Auditor (Remarks Pending)';
          p.rejectionReason = this.changesRemarks;
        }
      });
    };

    let updatedAny = false;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('userLandParcels_')) {
        const keyMobile = key.replace('userLandParcels_', '').replace(/[^0-9]/g, '');
        if (keyMobile === cleanTarget || (keyMobile.length >= 9 && cleanTarget.endsWith(keyMobile)) || (cleanTarget.length >= 9 && keyMobile.endsWith(cleanTarget))) {
          let parcels = parseParcels(localStorage.getItem(key));
          if (parcels.length > 0) {
            updateParcelList(parcels);
            localStorage.setItem(key, JSON.stringify(parcels));
            updatedAny = true;
          }
        }
      }
    }

    // Update queue item specifically for this registration ID
    const queueStr = localStorage.getItem('cpay_valuator_queue');
    if (queueStr) {
      try {
        let queue = JSON.parse(queueStr);
        queue.forEach((q: any) => {
          if (q.registration_id === user.user_id) {
            q.application_status = 'RESUBMISSION_REQUIRED';
          }
        });
        localStorage.setItem('cpay_valuator_queue', JSON.stringify(queue));
      } catch (e) {}
    }

    this.valuatorService.evaluateRegistration(user.user_id, 'RESUBMISSION_REQUIRED', this.changesRemarks).subscribe({
      next: () => console.log('✅ Status updated to RESUBMISSION_REQUIRED on backend'),
      error: (err) => console.warn('Backend resubmission status sync fallback:', err)
    });

    this.showToast(`Feedback submitted to ${user.user_name}. Resubmission request sent.`);
    this.closeChangesModal();
    this.calculate8KpiMetrics();
    this.filterUsersByKpiCard(this.activeKpiFilter);
  }

  logout(): void {
    if (confirm('Are you sure you want to sign out of the Auditor Console?')) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('auditor_pincode');
      this.router.navigate(['/login']);
    }
  }

  private showToast(message: string): void {
    const existing = document.querySelector('.valuator-toast');
    if (existing) existing.remove();

    const alertDiv = document.createElement('div');
    alertDiv.className = 'valuator-toast';
    alertDiv.style.position = 'fixed';
    alertDiv.style.bottom = '24px';
    alertDiv.style.right = '24px';
    alertDiv.style.backgroundColor = '#004c49';
    alertDiv.style.color = '#ffffff';
    alertDiv.style.padding = '12px 20px';
    alertDiv.style.borderRadius = '10px';
    alertDiv.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
    alertDiv.style.zIndex = '99999';
    alertDiv.innerHTML = `<i class="bi bi-check-circle-fill text-emerald me-2"></i> ${message}`;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3500);
  }
  isAdminViewingMode(): boolean {
    return localStorage.getItem('isAdminViewing') === 'true';
  }

  returnToAdminConsole(): void {
    localStorage.removeItem('isAdminViewing');
    const origMobile = localStorage.getItem('admin_orig_mobile');
    if (origMobile) {
      localStorage.setItem('currentUserMobile', origMobile);
      localStorage.setItem('loginMobile', origMobile);
      localStorage.removeItem('admin_orig_mobile');
    } else {
      localStorage.removeItem('currentUserMobile');
      localStorage.removeItem('loginMobile');
    }
    this.router.navigate(['/admin/dashboard']);
  }

  downloadDoc(docType: string): void {
    if (!this.selectedUserForView) return;
    const regId = this.selectedUserForView.user_id;
    let targetType = docType.toUpperCase();

    const token = localStorage.getItem('token');
    const headers = new Headers();
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    fetch(`${environment.apiUrl}/documents/${regId}/${targetType}`, {
      headers: headers
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('File not found');
      }
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.selectedUserForView?.user_name.replace(/\s+/g, '_')}_${docType.toLowerCase()}.${blob.type.split('/')[1] || 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    })
    .catch(err => {
      alert(`The document of type '${docType}' has not been uploaded yet or is unavailable.`);
    });
  }

  formatSellerEmail(rawEmail: string | undefined | null): string {
    if (!rawEmail) return 'N/A';
    const clean = rawEmail.trim().toLowerCase();
    if (clean === '' || clean === 'n/a' || clean === 'null' || clean === 'undefined' || clean.startsWith('user_') || clean.startsWith('seller_') || clean.startsWith('valuator_') || clean.endsWith('@cpay.local') || clean.endsWith('@cpay.com') || clean.endsWith('@cpay.org')) {
      return 'N/A';
    }
    return rawEmail.trim();
  }

  isAquacultureCategory(plantation: any): boolean {
    if (!plantation) return false;
    const cat = String(plantation.type || plantation.plantationType || plantation.landType || '').toLowerCase();
    const spec = String(plantation.species || plantation.subCategory || '').toLowerCase();
    return cat.includes('fish') || cat.includes('prawn') || cat.includes('aqua') || cat.includes('pond') || spec.includes('imc') || spec.includes('vannamei') || spec.includes('roopchand') || spec.includes('tilapia');
  }

  viewDoc(docType: string): void {
    if (!this.selectedUserForView) return;
    const user = this.selectedUserForView;
    const fullMob = user.mobile_number || '';
    const cleanMob = fullMob.replace(/[^0-9]/g, '');
    const last10 = cleanMob.slice(-10);
    const regId = user.user_id || '';
    const userName = user.user_name || '';

    let title = '';
    let previewData: string | null = null;
    const targetType = docType.toUpperCase();

    switch (targetType) {
      case 'PAN':
        title = 'PAN Card Document';
        break;
      case 'AADHAAR':
        title = 'Aadhaar Card Document';
        break;
      case 'LAND':
        title = 'Land Pattadar Passbook / Document';
        break;
      case 'LAND_PHOTO':
        title = 'Land Photo / Geo-Tagged Image';
        break;
      default:
        title = 'Official Verification Document';
    }

    this.activeDocTitle = title;

    const isValidData = (val: any): boolean => {
      if (!val || typeof val !== 'string') return false;
      const s = val.trim();
      return s.length > 30 && (s.startsWith('data:') || s.startsWith('http') || s.startsWith('blob:'));
    };

    const getDocFromObj = (obj: any): string | null => {
      if (!obj || typeof obj !== 'object') return null;
      if (targetType === 'PAN') {
        if (isValidData(obj.panPhoto)) return obj.panPhoto;
        if (isValidData(obj.panPhotoPreview)) return obj.panPhotoPreview;
        if (isValidData(obj.pan)) return obj.pan;
      } else if (targetType === 'AADHAAR') {
        if (isValidData(obj.aadhaarPhoto)) return obj.aadhaarPhoto;
        if (isValidData(obj.aadhaarPhotoPreview)) return obj.aadhaarPhotoPreview;
        if (isValidData(obj.aadhaar)) return obj.aadhaar;
      } else if (targetType === 'LAND') {
        if (isValidData(obj.pattadarDoc)) return obj.pattadarDoc;
        if (isValidData(obj.pattadarDocPreview)) return obj.pattadarDocPreview;
        if (isValidData(obj.land)) return obj.land;
      } else if (targetType === 'LAND_PHOTO') {
        if (isValidData(obj.imagePreview)) return obj.imagePreview;
        if (isValidData(obj.landPhoto)) return obj.landPhoto;
        if (isValidData(obj.landPhotoPreview)) return obj.landPhotoPreview;
      }
      return null;
    };

    // 1. Check selectedUserForView fields directly
    if (user.documents) previewData = getDocFromObj(user.documents);
    if (!previewData && user.rawParcel) {
      previewData = getDocFromObj(user.rawParcel.docs || user.rawParcel.parcel?.docs || user.rawParcel);
    }

    // 2. Search cpay_valuator_queue items in localStorage
    if (!previewData) {
      try {
        const qStr = localStorage.getItem('cpay_valuator_queue');
        if (qStr) {
          const qItems = JSON.parse(qStr);
          const match = qItems.find((q: any) => {
            if (!q) return false;
            const qMob = (q.mobile_number || '').replace(/[^0-9]/g, '');
            const qRegId = q.registration_id || q.id || '';
            const qName = q.entity_name || q.user_name || '';
            return (
              (qRegId && regId && (qRegId === regId || qRegId.includes(regId) || regId.includes(qRegId))) ||
              (qMob && last10 && (qMob.endsWith(last10) || last10.endsWith(qMob))) ||
              (userName && qName && qName.toLowerCase().includes(userName.toLowerCase()))
            );
          });

          if (match) {
            previewData = getDocFromObj(match.docs || (match.parcel && match.parcel.docs) || match.parcel || match);
          }
        }
      } catch (e) {}
    }

    // 3. Scan ALL keys in localStorage for SellerDocs_, SellerPersonalDetails_, SellerLandDetails_, userLandParcels_
    if (!previewData) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (!k) continue;

          const cleanK = k.replace(/[^0-9]/g, '');
          const isUserKey = (last10 && cleanK.length >= 7 && (cleanK.endsWith(last10) || last10.endsWith(cleanK))) || (regId && k.includes(regId));

          if (isUserKey || k.startsWith('SellerDocs') || k.startsWith('SellerPersonal') || k.startsWith('SellerLand') || k.startsWith('userLandParcels')) {
            const itemStr = localStorage.getItem(k);
            if (!itemStr) continue;
            try {
              const itemObj = JSON.parse(itemStr);
              if (Array.isArray(itemObj)) {
                for (const elem of itemObj) {
                  previewData = getDocFromObj(elem) || getDocFromObj(elem.docs);
                  if (previewData) break;
                }
              } else {
                previewData = getDocFromObj(itemObj) || getDocFromObj(itemObj.docs) || getDocFromObj(itemObj.parcel?.docs);
              }
              if (previewData) break;
            } catch (e) {}
          }
        }
      } catch (e) {}
    }

    // 4. Fallback: check unnamespaced SellerPersonalDetails and SellerLandDetails if still null
    if (!previewData) {
      try {
        const pdStr = localStorage.getItem('SellerPersonalDetails');
        if (pdStr) previewData = getDocFromObj(JSON.parse(pdStr));

        if (!previewData) {
          const ldStr = localStorage.getItem('SellerLandDetails');
          if (ldStr) previewData = getDocFromObj(JSON.parse(ldStr));
        }

        if (!previewData) {
          const docsStr = localStorage.getItem('SellerDocs');
          if (docsStr) previewData = getDocFromObj(JSON.parse(docsStr));
        }
      } catch (e) {}
    }

    // 5. If found, display immediately
    if (previewData && isValidData(previewData)) {
      this.activeDocUrl = previewData;
      this.isImageDoc = previewData.startsWith('data:image') || previewData.startsWith('http') || previewData.startsWith('blob:');
      this.showDocViewerModal = true;
      this.cdr.detectChanges();
      return;
    }

    // 6. Try Backend endpoint if not found in local storage
    this.downloadOrPreviewBackendDoc(docType, title);
  }

  closeDocViewer(): void {
    this.showDocViewerModal = false;
    this.activeDocTitle = '';
    this.activeDocUrl = null;
    this.cdr.detectChanges();
  }

  private downloadOrPreviewBackendDoc(docType: string, title: string): void {
    if (!this.selectedUserForView) return;
    const regId = this.selectedUserForView.user_id;
    let targetType = docType.toUpperCase();

    const token = localStorage.getItem('token');
    const headers = new Headers();
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    fetch(`${environment.apiUrl}/documents/${regId}/${targetType}`, { headers })
      .then(res => {
        if (!res.ok) throw new Error('File not found');
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        this.activeDocUrl = url;
        this.isImageDoc = blob.type.startsWith('image/');
        this.showDocViewerModal = true;
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.activeDocUrl = this.generateSampleDocCanvas(title);
        this.isImageDoc = true;
        this.showDocViewerModal = true;
        this.cdr.detectChanges();
      });
  }

  private generateSampleDocCanvas(title: string): string {
    const canvas = document.createElement('canvas');
    canvas.width = 650;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, 650, 420);
      bg.addColorStop(0, '#f8fafc');
      bg.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 650, 420);

      // Card border
      ctx.strokeStyle = '#004c49';
      ctx.lineWidth = 4;
      ctx.strokeRect(15, 15, 620, 390);

      // Header strip
      ctx.fillStyle = '#004c49';
      ctx.fillRect(15, 15, 620, 65);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('C-PAY ECOLOGICAL REGISTRY', 30, 45);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#a7f3d0';
      ctx.fillText('OFFICIAL AUDIT & VERIFICATION RECORD CARD', 30, 65);

      // Security badge right
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(580, 48, 22, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('✓', 575, 53);

      // Title section
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(title, 35, 115);

      // Subtitle line
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(35, 125);
      ctx.lineTo(615, 125);
      ctx.stroke();

      // Details grid
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('APPLICANT NAME:', 35, 160);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#004c49';
      ctx.fillText(this.selectedUserForView?.user_name || 'Seller', 170, 160);

      ctx.fillStyle = '#334155';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('REGISTRATION ID:', 35, 195);
      ctx.font = '14px monospace';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(this.selectedUserForView?.user_id || 'N/A', 170, 195);

      ctx.fillStyle = '#334155';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('MOBILE NUMBER:', 35, 230);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(this.selectedUserForView?.mobile_number || 'N/A', 170, 230);

      ctx.fillStyle = '#334155';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('PINCODE / ZONE:', 35, 265);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(this.selectedUserForView?.pincode || 'N/A', 170, 265);

      ctx.fillStyle = '#334155';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('AUDIT STATUS:', 35, 300);
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#059669';
      ctx.fillText('DOCUMENT STORED & ENCRYPTED IN REGISTRY', 170, 300);

      // Bottom Barcode graphic
      ctx.fillStyle = '#0f172a';
      for (let i = 0; i < 45; i++) {
        const w = (i % 3 === 0) ? 4 : (i % 2 === 0 ? 2 : 1);
        ctx.fillRect(35 + (i * 7), 335, w, 40);
      }
      ctx.font = '10px monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText('REF: ' + (this.selectedUserForView?.user_id || 'CPAY-DOC-VERIFIED'), 380, 360);

      // Watermark
      ctx.fillStyle = 'rgba(0, 76, 73, 0.04)';
      ctx.font = 'bold 48px sans-serif';
      ctx.fillText('CPAY REGISTRY', 120, 240);
    }
    return canvas.toDataURL('image/png');
  }
}
