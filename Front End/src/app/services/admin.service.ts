import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Dashboard API Endpoints
  getDashboardSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`);
  }

  getDashboardCards(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/cards`);
  }

  getDashboardCharts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/charts`);
  }

  getLatestRegistrations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/latest-registrations`);
  }

  getPendingApprovals(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/pending-approvals`);
  }

  getTopDistricts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/top-districts`);
  }

  getRecentActivities(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/recent-activities`);
  }

  // Users Management APIs
  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  createUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, data);
  }

  updateUser(userId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}`, data);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }

  // Registrations Management APIs
  getRegistrations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/registrations`);
  }

  updateRegistration(registrationId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/registrations/${registrationId}`, data);
  }

  deleteRegistration(registrationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/registrations/${registrationId}`);
  }

  // Valuators Management APIs
  getValuators(): Observable<any> {
    return this.http.get(`${this.apiUrl}/valuators`);
  }

  approveValuator(valuatorId: string, isApproved: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/valuators/${valuatorId}/approve`, { isApproved });
  }

  // Pending Approvals Queue (Sellers, Buyers, Auditors)
  getPendingQueue(): Observable<any> {
    return this.http.get(`${this.apiUrl}/pending-queue`);
  }

  approvePendingItem(itemId: string, category: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pending-queue/${itemId}/approve`, { category });
  }

  rejectPendingItem(itemId: string, category: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pending-queue/${itemId}/reject`, { category });
  }

  // Support & Helpdesk Management APIs
  getSupportTickets(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/support/tickets/all`);
  }

  updateTicketStatus(ticketId: string, status: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/support/tickets/${ticketId}/status`, { status });
  }

  addTicketMessage(ticketId: string, message: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/support/tickets/${ticketId}/messages`, { message });
  }
}
