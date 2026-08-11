import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { COUNTRIES } from '../../services/countries';
import { MockDatabaseService } from '../../services/mock-db.service';
import { AuthService } from '../../services/auth.service';
import { CustomSelectComponent } from '../../components/custom-select/custom-select';

import { RegistrationService } from '../../services/registration.service';

@Component({
  selector: 'app-personal-details',
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './personal-details.html',
  styleUrl: './personal-details.css'
})
export class PersonalDetailsComponent implements OnInit {
  selectedUserType: string = '';
  countriesList = COUNTRIES;
  genderOptions = [
    { label: 'Select Gender', value: '' },
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' }
  ];

  fullName: string = '';
  gender: string = '';
  divisionName: string = '';
  countryCode: string = '+91';
  mobileNumber: string = '';
  aadhaarNumber: string = '';
  aadhaarPhoto: string = '';
  aadhaarPhotoName: string = '';
  aadhaarPhotoPreview: string = '';
  managerName: string = '';
  managerId: string = '';
  panNumber: string = '';
  panPhoto: string = '';
  panPhotoName: string = '';
  panPhotoPreview: string = '';
  emailAddress: string = '';
  registrationId: string = '';
  gstNumber: string = '';

  constructor(
    private router: Router,
    private dbService: MockDatabaseService,
    private authService: AuthService,
    private registrationService: RegistrationService
  ) {
    this.selectedUserType = localStorage.getItem('selectedUserType') || '';
    const currentStep = 2;
    const storedFurthest = localStorage.getItem('SellerFurthestStep');
    const furthest = storedFurthest ? parseInt(storedFurthest, 10) : 1;
    if (currentStep > furthest) {
      localStorage.setItem('SellerFurthestStep', currentStep.toString());
    }
  }

  ngOnInit(): void {
    const pd = this.registrationService.getDraftData('SellerPersonalDetails');
    if (pd) {
      this.fullName = pd.fullName || '';
      this.gender = pd.gender || '';
      this.divisionName = pd.divisionName || '';
      this.parseMobileNumber(pd.mobileNumber || '');
      this.aadhaarNumber = pd.aadhaarNumber || '';
      this.aadhaarPhoto = pd.aadhaarPhoto || '';
      this.aadhaarPhotoName = pd.aadhaarPhotoName || '';
      this.aadhaarPhotoPreview = pd.aadhaarPhotoPreview || pd.aadhaarPhoto || '';
      this.managerName = pd.managerName || '';
      this.managerId = pd.managerId || '';
      this.panNumber = pd.panNumber || '';
      this.panPhoto = pd.panPhoto || '';
      this.panPhotoName = pd.panPhotoName || '';
      this.panPhotoPreview = pd.panPhotoPreview || pd.panPhoto || '';
      this.emailAddress = pd.emailAddress || '';
      this.registrationId = pd.registrationId || '';
      this.gstNumber = pd.gstNumber || '';
    }
  }

  isAadhaarDragging = false;
  isPanDragging = false;

  onAadhaarPhotoSelected(event: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processAadhaarFile(input.files[0]);
    }
  }

  onAadhaarDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isAadhaarDragging = true;
  }

  onAadhaarDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isAadhaarDragging = false;
  }

  onAadhaarDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isAadhaarDragging = false;
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.processAadhaarFile(event.dataTransfer.files[0]);
    }
  }

  private processAadhaarFile(file: File): void {
    this.aadhaarPhotoName = file.name;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.aadhaarPhoto = e.target.result;
      this.aadhaarPhotoPreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeAadhaarPhoto(): void {
    this.aadhaarPhoto = '';
    this.aadhaarPhotoName = '';
    this.aadhaarPhotoPreview = '';
  }

  onPanPhotoSelected(event: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processPanFile(input.files[0]);
    }
  }

  onPanDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isPanDragging = true;
  }

  onPanDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isPanDragging = false;
  }

  onPanDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isPanDragging = false;
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.processPanFile(event.dataTransfer.files[0]);
    }
  }

  private processPanFile(file: File): void {
    this.panPhotoName = file.name;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.panPhoto = e.target.result;
      this.panPhotoPreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removePanPhoto(): void {
    this.panPhoto = '';
    this.panPhotoName = '';
    this.panPhotoPreview = '';
  }

  parseMobileNumber(fullNumber: string): void {
    if (!fullNumber) return;
    if (fullNumber.startsWith('+')) {
      const codes = ['+91', '+1', '+44', '+61', '+49', '+971', '+65'];
      for (const code of codes) {
        if (fullNumber.startsWith(code)) {
          this.countryCode = code;
          this.mobileNumber = fullNumber.substring(code.length);
          return;
        }
      }
      const match = fullNumber.match(/^\+(\d{1,4})/);
      if (match) {
        this.countryCode = match[0];
        this.mobileNumber = fullNumber.substring(match[0].length);
        return;
      }
    }
    this.countryCode = '+91';
    this.mobileNumber = fullNumber;
  }

  back() {
    this.router.navigate(['/user-type']);
  }

  next() {
    // Basic field validation
    if (!this.fullName || !this.fullName.trim()) {
      const typeLabel = this.selectedUserType === 'NGO' ? 'NGO Name' : this.selectedUserType === 'Community' ? 'Community Name' : 'your name';
      alert(`Please enter ${typeLabel}`);
      return;
    }

    if (this.selectedUserType === 'NGO' || this.selectedUserType === 'Community') {
      if (!this.registrationId || !this.registrationId.trim()) {
        alert('Please enter Registration ID / License Number');
        return;
      }
      if (!this.gstNumber || !this.gstNumber.trim()) {
        alert('Please enter GST Number');
        return;
      }
      if (this.gstNumber.length !== 15) {
        alert('Please enter a valid 15-character GST Number');
        return;
      }
    } else if (this.selectedUserType === 'Government') {
      if (!this.divisionName || !this.divisionName.trim()) {
        alert('Please enter Division Name');
        return;
      }
    } else {
      if (!this.gender) {
        alert('Please select Gender');
        return;
      }
    }

    if (!this.mobileNumber || this.mobileNumber.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    if (this.selectedUserType === 'Government') {
      if (!this.managerName || !this.managerName.trim()) {
        alert('Please enter Manager Name');
        return;
      }
      if (!this.managerId || !this.managerId.trim()) {
        alert('Please enter Manager ID');
        return;
      }
    } else if (this.selectedUserType !== 'NGO' && this.selectedUserType !== 'Community') {
      if (!this.aadhaarNumber || this.aadhaarNumber.length < 12) {
        alert('Please enter a valid 12-digit Aadhaar number');
        return;
      }
      if (!this.aadhaarPhoto && !this.aadhaarPhotoName) {
        alert('Please upload your Aadhaar Card photo');
        return;
      }
      if (!this.aadhaarPhoto) {
        this.aadhaarPhoto = this.aadhaarPhotoPreview || this.aadhaarPhotoName || 'uploaded_aadhaar_file';
      }
    }

    if (!this.panNumber || this.panNumber.length < 10) {
      alert('Please enter a valid 10-character PAN number');
      return;
    }
    if (!this.panPhoto && !this.panPhotoName) {
      alert('Please upload your PAN Card photo');
      return;
    }
    if (!this.panPhoto) {
      this.panPhoto = this.panPhotoPreview || this.panPhotoName || 'uploaded_pan_file';
    }

    if (this.selectedUserType === 'NGO' || this.selectedUserType === 'Community' || this.selectedUserType === 'Government') {
      if (!this.emailAddress || !this.emailAddress.includes('@')) {
        alert('Please enter a valid email address');
        return;
      }
    }

    const fullMobile = this.countryCode + this.mobileNumber;
    const clean10 = fullMobile.replace(/[^0-9]/g, '').slice(-10);

    const currentMobile = localStorage.getItem('currentUserMobile') || localStorage.getItem('loginMobile') || '';
    const cleanCurrent10 = currentMobile.replace(/[^0-9]/g, '').slice(-10);
    const isSelfMobile = cleanCurrent10 && cleanCurrent10 === clean10;

    if (isSelfMobile) {
      this.proceedToAddress(fullMobile);
      return;
    }

    this.authService.checkMobile(fullMobile).subscribe({
      next: (res: any) => {
        if (res && res.exists && !isSelfMobile) {
          alert('The provided details are already existed.');
        } else {
          this.proceedToAddress(fullMobile);
        }
      },
      error: (err: any) => {
        console.error('Failed to check mobile existence via API, falling back to local database check', err);
        const existingUser = this.dbService.getUser(fullMobile);
        if (existingUser && existingUser.isRegistered && !isSelfMobile) {
          alert('The provided details are already existed.');
        } else {
          this.proceedToAddress(fullMobile);
        }
      }
    });
  }

  private proceedToAddress(fullMobile: string): void {
    const personalPayload = {
      fullName: this.fullName,
      gender: this.gender,
      divisionName: this.divisionName,
      mobileNumber: fullMobile,
      aadhaarNumber: this.aadhaarNumber,
      aadhaarPhoto: this.aadhaarPhoto || this.aadhaarPhotoPreview || this.aadhaarPhotoName,
      aadhaarPhotoName: this.aadhaarPhotoName,
      aadhaarPhotoPreview: this.aadhaarPhotoPreview || this.aadhaarPhoto || this.aadhaarPhotoName,
      managerName: this.managerName,
      managerId: this.managerId,
      panNumber: this.panNumber,
      panPhoto: this.panPhoto || this.panPhotoPreview || this.panPhotoName,
      panPhotoName: this.panPhotoName,
      panPhotoPreview: this.panPhotoPreview || this.panPhoto || this.panPhotoName,
      emailAddress: this.emailAddress,
      registrationId: this.registrationId,
      gstNumber: this.gstNumber
    };

    this.registrationService.setDraftData('SellerPersonalDetails', personalPayload, fullMobile);
    localStorage.setItem('currentUserMobile', fullMobile);

    this.router.navigate(['/address-details']);
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
