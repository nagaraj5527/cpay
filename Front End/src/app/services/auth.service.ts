import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /*
  =====================================================
  Base API URL
  =====================================================
  */
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /*
  =====================================================
  Send OTP
  =====================================================
  */
  sendOtp(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/send-otp`,
      data
    );
  }

  /*
  =====================================================
  Verify OTP
  =====================================================
  */
  verifyOtp(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/verify-otp`,
      data
    );
  }

  /*
  =====================================================
  Get Profile (Auth header automatically attached by interceptor)
  =====================================================
  */
  getProfile(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/auth/profile`
    );
  }

  /*
  =====================================================
  Logout (Auth header automatically attached by interceptor)
  =====================================================
  */
  logout(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/logout`,
      {}
    );
  }

  registerValuator(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/register-valuator`,
      data
    );
  }

  adminLogin(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/admin-login`,
      data
    );
  }

  checkMobile(mobile: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/auth/check-mobile/${encodeURIComponent(mobile)}`
    );
  }
}