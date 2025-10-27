import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InventoryItem {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  branchId: number;
  branchName: string;
  minStock: number;
  maxStock: number;
  // Add other inventory properties as needed
}

export interface InventoryAdjustment {
  productId: number;
  branchId: number;
  quantity: number;
  reason: string;
  type: 'addition' | 'subtraction';
}

export interface InventoryMovement {
  id: number;
  productId: number;
  productName: string;
  branchId: number;
  branchName: string;
  quantity: number;
  previousQuantity: number;
  type: string;
  reason: string;
  date: string;
  userId: number;
  userName: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) { }

  // Get all inventory items
  getInventory(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(this.apiUrl);
  }

  // Get inventory for a specific branch
  getBranchInventory(branchId: number): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.apiUrl}/sucursal/${branchId}`);
  }

  // Adjust inventory (add or remove stock)
  adjustInventory(adjustment: InventoryAdjustment): Observable<any> {
    return this.http.post(`${this.apiUrl}/ajuste`, adjustment);
  }

  // Get inventory movement history
  getInventoryMovements(): Observable<InventoryMovement[]> {
    return this.http.get<InventoryMovement[]>(`${this.apiUrl}/movimientos`);
  }
}
