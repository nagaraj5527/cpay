import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ValuatorService {
  private apiUrl = `${environment.apiUrl}/valuator`;

  constructor(private http: HttpClient) {}

  getRegistrations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/registrations`);
  }

  getRegistrationDetails(registrationId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/registrations/${registrationId}`);
  }

  evaluateRegistration(registrationId: string, status: 'VERIFIED_CORRECT' | 'VERIFIED_WRONG' | 'RESUBMISSION_REQUIRED', remarks: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/registrations/${registrationId}/evaluate`, { status, remarks });
  }

  getPincodeUsers(pincode: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pincode-users/${pincode}`);
  }
}
