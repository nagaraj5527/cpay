import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private apiUrl = `${environment.apiUrl}/registration`;

  constructor(private http: HttpClient) {}

  start(data: { registrationTypeId: string; userTypeId: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/start`, data);
  }

  savePersonalDetails(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/personal-details`, data);
  }

  saveOrganizationDetails(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/organization-details`, data);
  }

  saveGovernmentDetails(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/government-details`, data);
  }

  saveAddressDetails(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/address-details`, data);
  }

  saveLandDetails(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/land-details`, data);
  }

  savePlantationDetails(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/plantation-details`, data);
  }

  saveAquacultureDetails(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/aquaculture-details`, data);
  }

  saveCarbonCalculation(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/carbon-calculation`, data);
  }

  calculateCarbonLive(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/calculate-carbon-live`, data);
  }

  saveConsent(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/consent`, data);
  }

  preview(registrationId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/preview/${registrationId}`);
  }

  getCurrentRegistration(): Observable<any> {
    return this.http.get(`${this.apiUrl}/current`);
  }

  submit(data: { registrationId: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit`, data);
  }

  syncParcels(registrationId: string, parcels: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/sync-parcels`, { registrationId, parcels });
  }

  getParcelsList(registrationId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/sync-parcels/${registrationId}`);
  }

  submitFull(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit-full`, data);
  }

  submitBuyerRegistration(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit-buyer`, data);
  }

  uploadDocument(registrationId: string, documentType: string, file?: File | null, base64Data?: string, filename?: string): Observable<any> {
    if (file) {
      const formData = new FormData();
      formData.append('registrationId', registrationId);
      formData.append('documentType', documentType);
      formData.append('file', file);
      return this.http.post(`${environment.apiUrl}/documents/upload`, formData);
    } else {
      return this.http.post(`${environment.apiUrl}/documents/upload`, {
        registrationId,
        documentType,
        base64Data,
        filename: filename || `${documentType}.jpg`
      });
    }
  }

  getDocumentUrl(registrationId: string, documentType: string): string {
    return `${environment.apiUrl}/documents/${registrationId}/${documentType}`;
  }

  uploadProfilePhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${environment.apiUrl}/documents/profile-photo`, formData);
  }

  getProfilePhotoUrl(mobile: string): string {
    return `${environment.apiUrl}/documents/profile-photo/${mobile}`;
  }

  getDocumentStatusList(registrationId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/documents/status/${registrationId}`);
  }

  getUserAssets(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-assets`);
  }

  addAsset(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-asset`, data);
  }

  getReportData(registrationId?: string): Observable<any> {
    const url = registrationId ? `${this.apiUrl}/report/${registrationId}` : `${this.apiUrl}/report`;
    return this.http.get(url);
  }

  checkSurvey(surveyNumber: string, subDivision: string = ''): Observable<any> {
    return this.http.get(`${this.apiUrl}/check-survey?survey=${encodeURIComponent(surveyNumber)}&subDivision=${encodeURIComponent(subDivision)}`);
  }
}
