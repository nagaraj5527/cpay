import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDatabaseService } from '../../services/mock-db.service';
import { COUNTRIES } from '../../services/countries';
import { AuthService } from '../../services/auth.service';
import { RegistrationService } from '../../services/registration.service';

import { CustomSelectComponent } from '../custom-select/custom-select';

@Component({
  selector: 'app-seller-login',
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './seller-login.html',
  styleUrl: './seller-login.css'
})
export class SellerLogin implements OnInit {
  countriesList = COUNTRIES;
  countryCode: string = '+91';
  mobileNumber: string = '';
  otp: string = '';
  captchaInput: string = '';
  generatedCaptcha: string = '';
  rememberMe: boolean = false;
  loginType: string = 'Seller';
  isValuatorOnly: boolean = false;
  firstTimeLogin: boolean = false;

  get loginTypeOptions(): { label: string; value: string }[] {
    if (this.isValuatorOnly) {
      return [{ label: 'Valuator / Auditor', value: 'valuator' }];
    }
    return [
      { label: 'Seller', value: 'Seller' },
      { label: 'Buyer', value: 'buyer' }
    ];
  }
  
  otpSent: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isSendingOtp: boolean = false;
  isSubmitting: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dbService: MockDatabaseService,
    private authService: AuthService,
    private registrationService: RegistrationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    localStorage.removeItem('token');
    this.generateCaptcha();

    // Determine role based on route path
    const url = this.router.url;
    if (url.includes('/login/valuator')) {
      this.isValuatorOnly = true;
      this.loginType = 'valuator';
    } else {
      this.isValuatorOnly = false;
      this.loginType = 'Seller';
    }

    const loginMobile = localStorage.getItem('loginMobile');
    if (loginMobile) {
      this.parseMobileNumber(loginMobile);
      localStorage.removeItem('loginMobile');
    }

    if (localStorage.getItem('registrationSuccess') === 'true') {
      this.successMessage = this.isValuatorOnly
        ? 'Auditor registration submitted successfully! Enter your OTP to login.'
        : 'Registration submitted successfully! Enter your OTP to login.';
      localStorage.removeItem('registrationSuccess');
    }
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

  generateCaptcha(): void {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.generatedCaptcha = result;
  }

  sendOtp(): void {
    if (!this.mobileNumber || this.mobileNumber.length < 10) {
      this.errorMessage = 'Please enter a valid 10-digit mobile number';
      this.successMessage = '';
      return;
    }
    const fullMobile = this.countryCode + this.mobileNumber;
    this.errorMessage = '';
    this.successMessage = 'Sending OTP...';
    this.isSendingOtp = true;

    const localUser = this.dbService.getUser(fullMobile);
    const regMobiles = JSON.parse(localStorage.getItem('cpay_registered_mobiles') || '[]');
    const isRegisteredLocally = (localUser && localUser.isRegistered) || regMobiles.includes(fullMobile);

    this.authService.sendOtp({ mobileNumber: fullMobile, userType: this.loginType }).subscribe({
      next: (res: any) => {
        this.otpSent = true;
        this.isSendingOtp = false;
        if (res.otp) {
          this.successMessage = `OTP has been sent to your mobile number (Dev Mode OTP: ${res.otp})`;
          this.otp = res.otp;
        } else {
          this.successMessage = 'OTP has been sent to your mobile number.';
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        const backendMessage = err.error?.message;
        if (backendMessage && backendMessage.includes('register') && isRegisteredLocally) {
          // Auto-register user in backend if registered locally
          this.authService.sendOtp({ mobileNumber: fullMobile, isRegistration: true, userType: this.loginType }).subscribe({
            next: (res: any) => {
              this.otpSent = true;
              this.isSendingOtp = false;
              if (res.otp) {
                this.successMessage = `OTP has been sent to your mobile number (Dev Mode OTP: ${res.otp})`;
                this.otp = res.otp;
              } else {
                this.successMessage = 'OTP has been sent to your mobile number.';
              }
              this.cdr.detectChanges();
            },
            error: (err2: any) => {
              this.isSendingOtp = false;
              this.errorMessage = 'firstly u need to register then only login';
              this.successMessage = '';
              this.cdr.detectChanges();
            }
          });
          return;
        }

        this.isSendingOtp = false;
        console.error('Send OTP error', err);
        
        if (backendMessage) {
          if (backendMessage.includes('register') || backendMessage.includes('register first')) {
            this.errorMessage = 'firstly u need to register then only login';
          } else if (backendMessage.includes('processing') || backendMessage.includes('wait until') || backendMessage.includes('approval') || backendMessage.includes('Auditor account') || backendMessage.includes('Valuator')) {
            this.errorMessage = 'Your Auditor account is pending Super Admin approval. Please wait until approval before logging in.';
          } else {
            this.errorMessage = backendMessage;
          }
        } else {
          this.errorMessage = 'Failed to send OTP. Please check mobile number and try again.';
        }
        this.successMessage = '';
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.mobileNumber || this.mobileNumber.trim().length === 0) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.mobileNumber.length < 10) {
      this.errorMessage = 'Please enter a valid mobile number';
      return;
    }

    if (!this.otpSent) {
      this.errorMessage = 'Please click "Send OTP" first';
      return;
    }

    if (!this.otp || this.otp.length !== 6) {
      this.errorMessage = 'Please enter a valid 6-digit OTP';
      return;
    }

    if (!this.captchaInput || this.captchaInput.trim().toUpperCase() !== this.generatedCaptcha.trim().toUpperCase()) {
      this.errorMessage = 'Incorrect Captcha. Please try again.';
      this.generateCaptcha();
      return;
    }

    const fullMobile = this.countryCode + this.mobileNumber;
    this.isSubmitting = true;
    this.successMessage = 'Verifying and logging in...';

    this.authService.verifyOtp({ mobileNumber: fullMobile, otp: this.otp }).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        if (res.success && res.token) {
          this.successMessage = 'Logged in successfully! Redirecting...';
          localStorage.setItem('token', res.token);
          localStorage.setItem('currentUserMobile', fullMobile);

          if (this.loginType.toLowerCase() === 'valuator') {
            setTimeout(() => {
              alert('Welcome to C-PAY Portal as Valuator/Auditor!');
              this.router.navigate(['/valuator/dashboard']);
            }, 500);
            return;
          }

          if (this.loginType.toLowerCase() === 'buyer') {
            setTimeout(() => {
              alert('Welcome to C-PAY Portal as Buyer!');
              this.router.navigate(['/buyer/dashboard']);
            }, 500);
            return;
          }

          // Get profile and check active registration for Seller
          this.registrationService.getCurrentRegistration().subscribe({
            next: (regRes: any) => {
              const registration = regRes.data;
              setTimeout(() => {
                if (!registration || registration.application_status === 'DRAFT') {
                  alert("Welcome to C-PAY Portal! Let's complete your registration.");
                  this.router.navigate(['/registration']);
                } else {
                  alert('Welcome to C-PAY Portal as Seller!');
                  this.router.navigate(['/seller/dashboard']);
                }
              }, 1000);
            },
            error: (regErr) => {
              setTimeout(() => {
                alert("Welcome to C-PAY Portal! Let's complete your registration.");
                this.router.navigate(['/registration']);
              }, 1000);
            }
          });
        } else {
          this.errorMessage = 'Verification failed. Please try again.';
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error('Verify OTP error', err);
        const errStr = err.error?.message || '';

        if (this.loginType.toLowerCase() === 'valuator') {
          if (errStr.includes('processing') || errStr.includes('process') || errStr.includes('approval') || errStr.includes('wait until') || errStr.includes('Auditor account') || errStr.includes('Valuator')) {
            this.errorMessage = 'Your Auditor account is pending Super Admin approval. Please wait until approval before logging in.';
          } else {
            this.errorMessage = errStr || 'Invalid OTP. Please try again.';
          }
        } else {
          this.errorMessage = errStr || 'Invalid OTP. Please try again.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  goToRegistration(): void {
    this.registrationService.clearAllRegistrationDrafts();
    if (this.loginType === 'buyer') {
      this.router.navigate(['/buyer-registration']);
    } else if (this.loginType === 'valuator') {
      this.router.navigate(['/valuator/register']);
    } else {
      this.router.navigate(['/user-type']);
    }
  }
}
