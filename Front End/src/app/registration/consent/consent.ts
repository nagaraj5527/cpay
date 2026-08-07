import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { COUNTRIES } from '../../services/countries';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-consent',
  imports: [CommonModule, FormsModule],
  templateUrl: './consent.html',
  styleUrl: './consent.css',
})
export class ConsentComponent implements OnInit, OnDestroy {
  acceptTerms: boolean = false;
  agreePrivacy: boolean = false;
  provideConsent: boolean = false;
  signature: string = '';
  date: string = '';
  countriesList = COUNTRIES;
  countryCode: string = '+91';
  mobileNumber: string = '';

  // Inline OTP states
  otpSent: boolean = false;
  otpVerified: boolean = false;
  otpErrorMessage: string = '';
  generatedOtp: string = '';
  timerSeconds: number = 30;
  timerInterval: any = null;
  otpCode: string = '';
  isSendingOtp: boolean = false;
  isVerifyingOtp: boolean = false;
  otpInfoMessage: string = '';
  otpSuccessMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    const currentStep = 7;
    const storedFurthest = localStorage.getItem('SellerFurthestStep');
    const furthest = storedFurthest ? parseInt(storedFurthest, 10) : 1;
    if (currentStep > furthest) {
      localStorage.setItem('SellerFurthestStep', currentStep.toString());
    }
  }

  ngOnInit(): void {
    // Pre-populate date with today's date
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.date = `${yyyy}-${mm}-${dd}`;

    // Load registered mobile number from step 2 (Personal Details) if present, fallback to currentUserMobile
    const savedPersonal = localStorage.getItem('SellerPersonalDetails');
    if (savedPersonal) {
      try {
        const pd = JSON.parse(savedPersonal);
        if (pd.mobileNumber) {
          this.parseMobileNumber(pd.mobileNumber);
        }
      } catch (e) {
        console.error('Error parsing personal details in consent', e);
      }
    } else {
      const savedMobile = localStorage.getItem('currentUserMobile');
      if (savedMobile) {
        this.parseMobileNumber(savedMobile);
      }
    }
  }

  parseMobileNumber(fullNumber: string): void {
    if (!fullNumber) return;
    const cleanNumber = fullNumber.replace(/\s/g, ''); // Trim all whitespace characters
    if (cleanNumber.startsWith('+')) {
      const codes = ['+91', '+1', '+44', '+61', '+49', '+971', '+65'];
      for (const code of codes) {
        if (cleanNumber.startsWith(code)) {
          this.countryCode = code;
          this.mobileNumber = cleanNumber.substring(code.length);
          return;
        }
      }
      const match = cleanNumber.match(/^\+(\d{1,4})/);
      if (match) {
        this.countryCode = match[0];
        this.mobileNumber = cleanNumber.substring(match[0].length);
        return;
      }
    }
    this.countryCode = '+91';
    this.mobileNumber = cleanNumber;
  }

  ngOnDestroy(): void {
    this.clearInterval();
  }

  clearInterval(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  getOtpClick(): void {
    const isIndia = this.countryCode === '+91';
    const isValidPattern = isIndia ? /^[5-9]\d{9}$/.test(this.mobileNumber) : /^\d{7,15}$/.test(this.mobileNumber);
    if (!this.mobileNumber || !isValidPattern) {
      alert('Please enter a valid mobile number.');
      return;
    }
    
    const fullMobile = this.countryCode + this.mobileNumber;
    this.otpErrorMessage = '';
    this.otpSuccessMessage = '';
    this.otpInfoMessage = '';
    this.isSendingOtp = true;
    
    this.authService.sendOtp({ mobileNumber: fullMobile, userType: 'Seller', isRegistration: true }).subscribe({
      next: (res: any) => {
        this.otpSent = true;
        this.otpVerified = false;
        this.isSendingOtp = false;
        
        if (res.otp) {
          this.generatedOtp = res.otp;
          this.otpCode = res.otp; // Pre-fill for local convenience
          this.otpInfoMessage = `OTP code generated: ${res.otp}`;
        } else {
          this.otpInfoMessage = 'Verification code sent successfully to your mobile number.';
        }

        // Start countdown timer
        this.timerSeconds = 30;
        this.clearInterval();
        this.timerInterval = setInterval(() => {
          if (this.timerSeconds > 0) {
            this.timerSeconds--;
          } else {
            this.clearInterval();
          }
          this.cdr.detectChanges();
        }, 1000);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isSendingOtp = false;
        console.error('Consent sendOtp error', err);
        this.otpErrorMessage = err.error?.message || 'Failed to send OTP. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  verifyOtpInlineCode(): void {
    if (this.otpCode.length < 6) {
      this.otpErrorMessage = 'Please enter the complete 6-digit OTP.';
      return;
    }
    
    const fullMobile = this.countryCode + this.mobileNumber;
    this.isVerifyingOtp = true;
    this.otpErrorMessage = '';
    this.otpSuccessMessage = '';
    
    this.authService.verifyOtp({ mobileNumber: fullMobile, otp: this.otpCode, isRegistration: true }).subscribe({
      next: (res: any) => {
        this.isVerifyingOtp = false;
        if (res.success && res.token) {
          this.clearInterval();
          this.otpVerified = true;
          this.otpErrorMessage = '';
          this.otpInfoMessage = '';
          this.otpSuccessMessage = 'Mobile number verified successfully! Secure session established.';
          
          // Secure the backend session token in localStorage
          localStorage.setItem('token', res.token);
          localStorage.setItem('currentUserMobile', fullMobile);
        } else {
          this.otpErrorMessage = 'Verification failed. Please try again.';
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isVerifyingOtp = false;
        console.error('Consent verifyOtp error', err);
        this.otpErrorMessage = err.error?.message || 'Invalid OTP code. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  back(): void {
    this.router.navigate(['/carbon-calculator']);
  }

  next(): void {
    if (!this.acceptTerms || !this.agreePrivacy || !this.provideConsent) {
      alert('Please check all declarations and accept the terms to continue.');
      return;
    }
    
    if (!this.signature || this.signature.trim().length === 0) {
      alert('Please provide your digital signature name.');
      return;
    }

    const isIndia = this.countryCode === '+91';
    const isValidPattern = isIndia ? /^[5-9]\d{9}$/.test(this.mobileNumber) : /^\d{7,15}$/.test(this.mobileNumber);
    if (!this.mobileNumber || !isValidPattern) {
      alert('Please enter a valid mobile number.');
      return;
    }

    if (!this.otpVerified) {
      alert('Please verify your mobile number with OTP before continuing.');
      return;
    }
    
    if (!this.date) {
      alert('Please select the declaration date.');
      return;
    }

    // Save consent to localStorage
    try {
      localStorage.setItem('SellerConsentDetails', JSON.stringify({
        signature: this.signature,
        date: this.date,
        mobileNumber: this.countryCode + this.mobileNumber,
        verified: true
      }));
    } catch (e) {
      console.warn('[Storage] Quota exceeded in consent details, proceeding safely:', e);
    }
    
    // Navigate directly to Step 8: Preview
    this.router.navigate(['/preview']);
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
