import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLogin implements OnInit {
  username: string = '';
  password: string = '';
  captchaInput: string = '';
  generatedCaptcha: string = '';
  rememberMe: boolean = false;
  showPassword = false;

  errorMessage: string = '';
  successMessage: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.generateCaptcha();
  }

  generateCaptcha(): void {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.generatedCaptcha = result;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.username || this.username.trim().length === 0) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.password || this.password.length === 0) {
      this.errorMessage = 'Please enter your password';
      return;
    }

    if (!this.captchaInput || this.captchaInput.trim().toUpperCase() !== this.generatedCaptcha.trim().toUpperCase()) {
      this.errorMessage = 'Incorrect Captcha. Please try again.';
      this.generateCaptcha();
      return;
    }

    // Backend Admin Login call
    this.successMessage = 'Authenticating...';
    this.authService.adminLogin({ username: this.username, password: this.password }).subscribe({
      next: (res: any) => {
        if (res.success && res.token) {
          this.successMessage = 'Logged in successfully! Redirecting...';
          localStorage.setItem('token', res.token);
          setTimeout(() => {
            this.router.navigate(['/admin/dashboard']);
          }, 1500);
        } else {
          this.errorMessage = 'Login failed. Please check credentials.';
        }
      },
      error: (err: any) => {
        console.error('Admin login error', err);
        this.errorMessage = err.error?.message || 'Invalid username or password. Please try again.';
        this.successMessage = '';
      }
    });
  }
}
