import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SaleItem {
  productId: number;
  quantity: number;
  price: number;
  productName?: string;
  subtotal?: number;
}

export interface Sale {
  id?: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'cancelled';
  branchId: number;
  userId: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private apiUrl = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) { }

  // Get all sales
  getSales(): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.apiUrl);
  }

  // Get a single sale by ID
  getSaleById(id: number): Observable<Sale> {
    return this.http.get<Sale>(`${this.apiUrl}/${id}`);
  }

  // Create a new sale
  createSale(sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Observable<Sale> {
    return this.http.post<Sale>(this.apiUrl, sale);
  }

  // Cancel a sale
  cancelSale(id: number, reason: string = ''): Observable<Sale> {
    return this.http.put<Sale>(`${this.apiUrl}/${id}/cancel`, { reason });
  }

  // Get sales by date range
  getSalesByDateRange(startDate: string, endDate: string): Observable<Sale[]> {
    return this.http.get<Sale[]>(`${this.apiUrl}?startDate=${startDate}&endDate=${endDate}`);
  }

  // Get sales by status
  getSalesByStatus(status: string): Observable<Sale[]> {
    return this.http.get<Sale[]>(`${this.apiUrl}?status=${status}`);
  }
}
