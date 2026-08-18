import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

import { CustomSelectComponent } from '../custom-select/custom-select';

@Component({
  selector: 'app-valuator-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CustomSelectComponent],
  templateUrl: './valuator-registration.html',
  styleUrl: './valuator-registration.css'
})
export class ValuatorRegistrationComponent {
  get countryOptions(): { label: string; value: string }[] {
    return [
      { label: '🇮🇳 +91', value: '+91' },
      { label: '🇺🇸 +1', value: '+1' },
      { label: '🇬🇧 +44', value: '+44' },
      { label: '🇦🇪 +971', value: '+971' }
    ];
  }
  // Active Stepper Navigation
  activeStep: number = 1;

  // Form Fields
  name: string = '';
  countryCode: string = '+91';
  mobileNumber: string = '';
  email: string = '';
  aadhaarNumber: string = '';
  panNumber: string = '';
  licence: string = '';
  address: string = '';

  // File Upload State
  aadhaarFile: File | null = null;
  aadhaarFileName: string = '';
  aadhaarFileSize: string = '';
  isAadhaarDragging: boolean = false;

  panFile: File | null = null;
  panFileName: string = '';
  panFileSize: string = '';
  isPanDragging: boolean = false;

  licenceFile: File | null = null;
  licenceFileName: string = '';
  licenceFileSize: string = '';
  isLicenceDragging: boolean = false;

  errorMessage: string = '';
  successMessage: string = '';
  isSubmitting: boolean = false;

  countriesList = [
    { code: '+91', flag: '🇮🇳', name: 'India' },
    { code: '+1', flag: '🇺🇸', name: 'USA' },
    { code: '+44', flag: '🇬🇧', name: 'UK' },
    { code: '+971', flag: '🇦🇪', name: 'UAE' },
    { code: '+61', flag: '🇦🇺', name: 'Australia' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // Stepper navigation
  setStep(step: number): void {
    this.activeStep = step;
  }

  // Real-time validation getters
  get isNameValid(): boolean {
    return this.name.trim().length >= 3;
  }

  get isMobileValid(): boolean {
    return /^[0-9]{10}$/.test(this.mobileNumber);
  }

  get isAadhaarValid(): boolean {
    return /^[0-9]{12}$/.test(this.aadhaarNumber);
  }

  get isPanValid(): boolean {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(this.panNumber);
  }

  get isLicenceValid(): boolean {
    return this.licence.trim().length >= 3;
  }

  get isAddressValid(): boolean {
    return this.address.trim().length >= 5;
  }

  // File Handling & Drag & Drop
  onFileSelected(event: Event, type: 'aadhaar' | 'pan' | 'licence'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0], type);
    }
  }

  onDragOver(event: DragEvent, type: 'aadhaar' | 'pan' | 'licence'): void {
    event.preventDefault();
    event.stopPropagation();
    this.setDraggingState(type, true);
  }

  onDragLeave(event: DragEvent, type: 'aadhaar' | 'pan' | 'licence'): void {
    event.preventDefault();
    event.stopPropagation();
    this.setDraggingState(type, false);
  }

  onDrop(event: DragEvent, type: 'aadhaar' | 'pan' | 'licence'): void {
    event.preventDefault();
    event.stopPropagation();
    this.setDraggingState(type, false);

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0], type);
    }
  }

  private setDraggingState(type: 'aadhaar' | 'pan' | 'licence', isDragging: boolean): void {
    if (type === 'aadhaar') this.isAadhaarDragging = isDragging;
    else if (type === 'pan') this.isPanDragging = isDragging;
    else if (type === 'licence') this.isLicenceDragging = isDragging;
  }

  private processFile(file: File, type: 'aadhaar' | 'pan' | 'licence'): void {
    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = `File size for ${type.toUpperCase()} exceeds maximum limit of 5MB.`;
      return;
    }
    this.errorMessage = '';

    const formattedSize = this.formatBytes(file.size);

    if (type === 'aadhaar') {
      this.aadhaarFile = file;
      this.aadhaarFileName = file.name;
      this.aadhaarFileSize = formattedSize;
    } else if (type === 'pan') {
      this.panFile = file;
      this.panFileName = file.name;
      this.panFileSize = formattedSize;
    } else if (type === 'licence') {
      this.licenceFile = file;
      this.licenceFileName = file.name;
      this.licenceFileSize = formattedSize;
    }
  }

  removeFile(type: 'aadhaar' | 'pan' | 'licence', event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (type === 'aadhaar') {
      this.aadhaarFile = null;
      this.aadhaarFileName = '';
      this.aadhaarFileSize = '';
    } else if (type === 'pan') {
      this.panFile = null;
      this.panFileName = '';
      this.panFileSize = '';
    } else if (type === 'licence') {
      this.licenceFile = null;
      this.licenceFileName = '';
      this.licenceFileSize = '';
    }
  }

  formatAadhaar(): void {
    if (this.aadhaarNumber) {
      this.aadhaarNumber = this.aadhaarNumber.replace(/[^0-9]/g, '').slice(0, 12);
    }
  }

  formatPan(): void {
    if (this.panNumber) {
      this.panNumber = this.panNumber.toUpperCase().slice(0, 10);
    }
  }

  private formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  showSuccessModal: boolean = false;
  registrationRefId: string = '';

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.isNameValid) {
      this.errorMessage = 'Please enter your Full Name (minimum 3 characters)';
      return;
    }

    if (!this.isMobileValid) {
      this.errorMessage = 'Please enter a valid 10-digit mobile number';
      return;
    }

    const fullMobile = this.countryCode + this.mobileNumber;

    if (!this.isAadhaarValid) {
      this.errorMessage = 'Please enter a valid 12-digit Aadhaar Card Number';
      return;
    }

    if (!this.aadhaarFile) {
      this.errorMessage = 'Please upload your Aadhaar Card document';
      return;
    }

    if (!this.isPanValid) {
      this.errorMessage = 'Please enter a valid PAN Card Number (e.g. ABCDE1234F)';
      return;
    }

    if (!this.panFile) {
      this.errorMessage = 'Please upload your PAN Card document';
      return;
    }

    if (!this.isLicenceValid) {
      this.errorMessage = 'Please enter your Auditor / Valuator License Number';
      return;
    }

    if (!this.licenceFile) {
      this.errorMessage = 'Please upload your License Certificate document';
      return;
    }

    if (!this.isAddressValid) {
      this.errorMessage = 'Please enter your complete Office Address';
      return;
    }

    this.isSubmitting = true;

    const payload = {
      mobileNumber: fullMobile,
      name: this.name,
      address: this.address,
      licence: this.licence,
      aadhaarNumber: this.aadhaarNumber,
      panNumber: this.panNumber,
      aadhaarFileName: this.aadhaarFileName,
      panFileName: this.panFileName,
      licenceFileName: this.licenceFileName
    };

    const newValuator = {
      id: 'val_' + Date.now(),
      valuator_id: 'val_' + Date.now(),
      name: this.name,
      applicant_name: this.name,
      applicant_type: 'Auditor / Valuator',
      mobile_number: fullMobile,
      email: `valuator_${fullMobile.replace(/[^0-9]/g, '')}@cpay.com`,
      address: this.address,
      licence: this.licence,
      identity_doc: this.licence || this.panNumber || this.aadhaarNumber || 'Licence Pending',
      is_approved: false,
      status: 'PENDING',
      category: 'VALUATOR',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      created_at: new Date().toISOString()
    };

    try {
      const pendingValuators = JSON.parse(localStorage.getItem('cpay_valuator_queue') || '[]');
      const exists = pendingValuators.some((v: any) => v.mobile_number === fullMobile);
      if (!exists) {
        pendingValuators.unshift(newValuator);
        localStorage.setItem('cpay_valuator_queue', JSON.stringify(pendingValuators));
      }
    } catch (e) {}

    localStorage.setItem('loginMobile', fullMobile);

    this.authService.registerValuator(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.registrationRefId = res?.data?.valuatorId || res?.data?.userId || 'AUD-' + Math.floor(100000 + Math.random() * 900000);
        this.successMessage = res?.message || 'Auditor registration submitted successfully! Pending Super Admin verification.';
        this.showSuccessModal = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err: any) => {
        console.error('Valuator registration response:', err);
        this.isSubmitting = false;
        const msg = err?.error?.message || err?.error?.error || 'Registration failed. Please check your details and try again.';
        this.errorMessage = msg;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login/valuator']);
  }
}


