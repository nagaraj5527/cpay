import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WalletData {
  creditBalance: number;
  cashBalance: number;
  currency: string;
  transactions: any[];
  trades: any[];
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private apiUrl = `${environment.apiUrl}/wallet`;

  constructor(private http: HttpClient) {}

  getWallet(): Observable<{ success: boolean; data: WalletData }> {
    return this.http.get<{ success: boolean; data: WalletData }>(this.apiUrl);
  }

  executeTrade(tradePayload: { quantity: number; tradeType: 'BUY' | 'SELL'; project?: string; pricePerCredit?: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/trade`, tradePayload);
  }
}
