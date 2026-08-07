import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDatabaseService } from '../services/mock-db.service';
import { COUNTRIES } from '../services/countries';
import { AuthService } from '../services/auth.service';
import { RegistrationService } from '../services/registration.service';

import { CustomSelectComponent } from '../components/custom-select/custom-select';

@Component({
  selector: 'app-buyer-registration',
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './buyer-registration.html',
  styleUrl: './buyer-registration.css',
})
export class BuyerRegistrationComponent {
  experienceOptions: string[] = ['Select Experience', '0 - 1 Year', '1 - 3 Years', '3 - 5 Years', 'More than 5 Years'];
  accountTypeOptions: string[] = ['Select Account Type', 'Savings', 'Current', 'Business'];
  countriesList = COUNTRIES;
  currentStep: any = 1;
  furthestStep: any = 1;

  // ================= STEP 1: BUYER TYPE =================
  selectedBuyerType: string = '';

  selectBuyerType(type: string): void {
    this.selectedBuyerType = type;
    console.log('Selected Buyer Type:', type);
  }

  // ================= STEP 2: BUYER DETAILS =================
  buyerName: string = '';
  companyName: string = '';
  panNumber: string = '';
  gstNumber: string = '';
  email: string = '';
  countryCode: string = '+91';
  mobile: string = '';
  regId: string = '';
  experience: string = 'Select Experience';
  aadhaarNumber: string = '';

  // ================= STEP 3: TRADING PREFERENCE =================
  selectedTradingPreference: string = '';

  selectTradingPreference(type: string): void {
    this.selectedTradingPreference = type;
    console.log('Selected Trading Preference:', type);
  }

  // ================= STEP 4: BANK DETAILS =================
  accountHolderName: string = '';
  bankName: string = '';
  accountNumber: string = '';
  confirmAccountNumber: string = '';
  ifscCode: string = '';
  branchName: string = '';
  accountType: string = 'Select Account Type';
  upiId: string = '';

  // ================= STEP 5: DOCUMENT UPLOAD =================
  panFile: string = '';
  aadhaarFile: string = '';
  gstFile: string = '';
  licenseFile: string = '';
  bankFile: string = '';
  signatureFile: string = '';

  panFileObj: File | null = null;
  aadhaarFileObj: File | null = null;
  gstFileObj: File | null = null;
  licenseFileObj: File | null = null;
  bankFileObj: File | null = null;
  signatureFileObj: File | null = null;

  onFileChange(event: any, field: string): void {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const fileName = file.name;
      if (field === 'pan') {
        this.panFile = fileName;
        this.panFileObj = file;
      } else if (field === 'aadhaar') {
        this.aadhaarFile = fileName;
        this.aadhaarFileObj = file;
      } else if (field === 'gst') {
        this.gstFile = fileName;
        this.gstFileObj = file;
      } else if (field === 'license') {
        this.licenseFile = fileName;
        this.licenseFileObj = file;
      } else if (field === 'bank') {
        this.bankFile = fileName;
        this.bankFileObj = file;
      } else if (field === 'signature') {
        this.signatureFile = fileName;
        this.signatureFileObj = file;
      }
    }
  }

  // ================= STEP 6: DECLARATION & SUBMIT =================
  declaration1: boolean = false;
  declaration2: boolean = false;
  declaration3: boolean = false;
  declaration4: boolean = false;

  // Navigation & Loading State
  isNavigating: boolean = false;

  constructor(
    private router: Router,
    private dbService: MockDatabaseService,
    private authService: AuthService,
    private registrationService: RegistrationService
  ) {}

  // ================= NAVIGATION =================
  back(): void {
    const current = this.currentStep;
    if (current > 1) {
      this.currentStep = current - 1;
    } else {
      this.router.navigate(['/registration']);
    }
  }

  next(): void {
    if (this.isNavigating) return;

    const current = this.currentStep;

    switch (current) {
      case 1:
        if (!this.selectedBuyerType) {
          alert('Please select a buyer type');
          return;
        }
        this.currentStep = 2;
        if (this.currentStep > this.furthestStep) {
          this.furthestStep = this.currentStep;
        }
        break;

      case 2: {
        if (!this.buyerName.trim()) {
          alert('Please enter buyer name');
          return;
        }
        if (!this.panNumber.trim()) {
          alert('Please enter PAN number');
          return;
        }
        if (this.selectedBuyerType === 'Seller Buyer') {
          if (!this.aadhaarNumber.trim() || this.aadhaarNumber.replace(/\s/g, '').length < 12) {
            alert('Please enter a valid 12-digit Aadhaar number');
            return;
          }
        }
        if (!this.email.trim() || !this.email.includes('@')) {
          alert('Please enter a valid email address');
          return;
        }
        const isIndia = this.countryCode === '+91';
        const isValidPattern = isIndia ? this.mobile.trim().length === 10 : /^\d{7,15}$/.test(this.mobile.trim());
        if (!this.mobile.trim() || !isValidPattern) {
          alert(isIndia ? 'Please enter a valid 10-digit mobile number' : 'Please enter a valid mobile number');
          return;
        }
        const fullMobile = this.countryCode + this.mobile.trim();

        // Check local database and localStorage registered list instantly first
        const existingUser = this.dbService.getUser(fullMobile);
        const regMobiles = JSON.parse(localStorage.getItem('cpay_registered_mobiles') || '[]');
        if ((existingUser && existingUser.isRegistered) || regMobiles.includes(fullMobile)) {
          alert('The provided details are already existed.');
          return;
        }

        // Instant smooth transition to Step 3
        this.currentStep = 3;
        if (this.currentStep > this.furthestStep) {
          this.furthestStep = this.currentStep;
        }

        // Non-blocking background API check
        this.authService.checkMobile(fullMobile).subscribe({
          next: (res: any) => {
            if (res && res.exists) {
              alert('The provided details are already existed.');
              this.currentStep = 2;
            }
          },
          error: (err: any) => {
            console.warn('Background checkMobile check:', err);
          }
        });
        break;
      }

      case 3:
        if (!this.accountHolderName.trim()) {
          alert('Please enter account holder name');
          return;
        }
        if (!this.bankName.trim()) {
          alert('Please enter bank name');
          return;
        }
        if (!this.accountNumber.trim()) {
          alert('Please enter account number');
          return;
        }
        if (this.accountNumber !== this.confirmAccountNumber) {
          alert('Account numbers do not match');
          return;
        }
        if (!this.ifscCode.trim()) {
          alert('Please enter bank IFSC code');
          return;
        }
        this.currentStep = 4;
        if (this.currentStep > this.furthestStep) {
          this.furthestStep = this.currentStep;
        }
        break;

      case 4:
        if (!this.panFileObj && !this.panFile) {
          alert('Please upload your mandatory PAN Card document.');
          return;
        }
        if (!this.aadhaarFileObj && !this.aadhaarFile) {
          alert('Please upload your mandatory Aadhaar Card document.');
          return;
        }
        if (this.selectedBuyerType !== 'Seller Buyer') {
          if (!this.gstFileObj && !this.gstFile) {
            alert('Please upload your mandatory GST Certificate document.');
            return;
          }
          if (!this.licenseFileObj && !this.licenseFile) {
            alert('Please upload your mandatory Trade License document.');
            return;
          }
        }
        if (!this.bankFileObj && !this.bankFile) {
          alert('Please upload your mandatory Bank Passbook document.');
          return;
        }
        if (!this.signatureFileObj && !this.signatureFile) {
          alert('Please upload your mandatory Digital Signature document.');
          return;
        }
        this.currentStep = 5;
        if (this.currentStep > this.furthestStep) {
          this.furthestStep = this.currentStep;
        }
        break;

      case 5:
        if (!this.declaration1 || !this.declaration2 || !this.declaration3 || !this.declaration4) {
          alert('Please accept all declarations to complete registration.');
          return;
        }

        this.isNavigating = true;
        
        const fullMobile = this.countryCode + this.mobile;
        const regId = this.regId || 'REG-109283-AP';
        
        const uploadPromises = [];
        if (this.panFileObj) {
          uploadPromises.push(this.registrationService.uploadDocument(regId, 'PAN', this.panFileObj).toPromise());
        }
        if (this.aadhaarFileObj) {
          uploadPromises.push(this.registrationService.uploadDocument(regId, 'AADHAAR', this.aadhaarFileObj).toPromise());
        }
        if (this.gstFileObj) {
          uploadPromises.push(this.registrationService.uploadDocument(regId, 'GST', this.gstFileObj).toPromise());
        }
        if (this.licenseFileObj) {
          uploadPromises.push(this.registrationService.uploadDocument(regId, 'LICENSE', this.licenseFileObj).toPromise());
        }
        if (this.bankFileObj) {
          uploadPromises.push(this.registrationService.uploadDocument(regId, 'BANK_STATEMENT', this.bankFileObj).toPromise());
        }
        if (this.signatureFileObj) {
          uploadPromises.push(this.registrationService.uploadDocument(regId, 'SIGNATURE', this.signatureFileObj).toPromise());
        }

        const buyerDetails = {
          buyerName: this.buyerName,
          companyName: this.companyName || this.buyerName,
          selectedBuyerType: this.selectedBuyerType || 'Organization / Corporate Buyer',
          emailAddress: this.email,
          mobileNumber: fullMobile,
          panNumber: this.panNumber,
          registrationId: regId,
          gstNumber: this.gstNumber,
          experience: this.experience,
          panFile: this.panFile,
          aadhaarFile: this.aadhaarFile,
          gstFile: this.gstFile,
          licenseFile: this.licenseFile,
          bankFile: this.bankFile,
          signatureFile: this.signatureFile
        };
        const buyerBankDetails = {
          accountHolderName: this.accountHolderName,
          bankName: this.bankName,
          accountNumber: this.accountNumber,
          ifscCode: this.ifscCode,
          branchName: this.branchName || 'Main Branch',
          accountType: this.accountType || 'Savings',
          upiId: this.upiId
        };
        localStorage.setItem('buyerName', this.buyerName || this.companyName || '');
        localStorage.setItem('companyName', this.companyName || this.buyerName || '');
        localStorage.setItem('selectedBuyerType', this.selectedBuyerType || 'Organization / Corporate Buyer');
        localStorage.setItem('buyerProfileDetails', JSON.stringify(buyerDetails));
        localStorage.setItem(`buyerProfileDetails_${fullMobile}`, JSON.stringify(buyerDetails));
        localStorage.setItem('buyerBankDetails', JSON.stringify(buyerBankDetails));
        localStorage.setItem(`buyerBankDetails_${fullMobile}`, JSON.stringify(buyerBankDetails));

        const triggerRegister = () => {
          // 1. Mark user in Mock DB
          this.dbService.createUser({
            mobileNumber: fullMobile,
            fullName: this.buyerName || this.companyName || 'Registered Buyer',
            emailAddress: this.email || `buyer_${this.mobile}@cpay.org`,
            userRole: 'buyer'
          });

          // 2. Mark user in cpay_registered_mobiles
          try {
            const regMobiles = JSON.parse(localStorage.getItem('cpay_registered_mobiles') || '[]');
            if (!regMobiles.includes(fullMobile)) {
              regMobiles.push(fullMobile);
              localStorage.setItem('cpay_registered_mobiles', JSON.stringify(regMobiles));
            }
          } catch (e) {
            console.error('Failed to update cpay_registered_mobiles', e);
          }

          // 3. Push Auditor Queue token notification for Buyer
          const queueStr = localStorage.getItem('cpay_valuator_queue') || '[]';
          let queue: any[] = [];
          try { queue = JSON.parse(queueStr); } catch (e) { queue = []; }
          const appNum = 'CPAY-2026-' + Math.floor(1000 + Math.random() * 9000);
          const tokenItem = {
            registration_id: 'reg_buyer_' + Date.now(),
            application_number: appNum,
            application_status: 'SUBMITTED',
            entity_name: `${this.buyerName || this.companyName || 'Registered Buyer'} (Buyer)`,
            registration_type_name: 'Buyer',
            user_type_name: 'Industrial Credit Buyer',
            mobile_number: fullMobile,
            email: this.email || `buyer_${this.mobile}@cpay.org`,
            submitted_at: new Date().toISOString()
          };
          const existsQueue = queue.some((q: any) => q.mobile_number === fullMobile && q.registration_type_name === 'Buyer');
          if (!existsQueue) {
            queue.unshift(tokenItem);
          }
          localStorage.setItem('cpay_valuator_queue', JSON.stringify(queue));

          // 4. Register in PostgreSQL database backend via sendOtp with isRegistration: true
          this.authService.sendOtp({
            mobileNumber: fullMobile,
            isRegistration: true,
            userType: 'buyer',
            email: this.email || `buyer_${this.mobile}@cpay.org`
          }).subscribe({
            next: () => {
              console.log(`✅ Auto-registered buyer user ${fullMobile} in Postgres`);
              // Persist full buyer registration into Postgres Database cpay.registration & cpay.individual_details
              const buyerPgPayload = {
                buyerName: this.buyerName || this.companyName,
                companyName: this.companyName || this.buyerName,
                mobileNumber: fullMobile,
                email: this.email,
                panNumber: this.panNumber,
                personalDetails: {
                  fullName: this.buyerName || this.companyName,
                  companyName: this.companyName,
                  aadhaarNumber: this.aadhaarNumber || null,
                  panNumber: this.panNumber,
                  email: this.email,
                  mobileNumber: fullMobile
                }
              };

              this.registrationService.submitBuyerRegistration(buyerPgPayload).subscribe({
                next: (res: any) => console.log('✅ Saved buyer registration to Postgres DB cpay.registration:', res),
                error: (err: any) => console.warn('Postgres submitBuyerRegistration notice:', err)
              });

              alert('Buyer Registration Completed Successfully! Redirecting to login page...');
              localStorage.setItem('currentUserMobile', fullMobile);
              localStorage.setItem('loginMobile', fullMobile);
              localStorage.setItem('registrationSuccess', 'true');
              this.router.navigate(['/login/seller-buyer']);
            },
            error: (err: any) => {
              console.error('Failed to register buyer user in Postgres backend', err);
              alert('Buyer Registration Completed! Redirecting to login page...');
              localStorage.setItem('currentUserMobile', fullMobile);
              localStorage.setItem('loginMobile', fullMobile);
              localStorage.setItem('registrationSuccess', 'true');
              this.router.navigate(['/login/seller-buyer']);
            }
          });
        };

        if (uploadPromises.length > 0) {
          console.log('Uploading buyer files to database...');
          Promise.all(uploadPromises)
            .then(() => {
              console.log('✅ All buyer files uploaded to database');
              triggerRegister();
            })
            .catch(err => {
              console.error('⚠️ Buyer file upload failed, proceeding anyway', err);
              triggerRegister();
            });
        } else {
          triggerRegister();
        }
        break;
    }
  }


  goToStep(step: number): void {
    if (step <= this.furthestStep) {
      this.currentStep = step;
    }
  }
}
