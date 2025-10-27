// dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getDashboardStats() {
    // Make parallel requests to get all necessary data
    return forkJoin({
      products: this.safeGet(`${this.apiUrl}/products`),
      sales: this.safeGet(`${this.apiUrl}/sales`),
      inventory: this.safeGet(`${this.apiUrl}/inventory`),
      users: this.safeGet(`${this.apiUrl}/users`)
    }).pipe(
      map(data => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Calculate monthly sales
        const monthlySales = this.calculateMonthlySales(data.sales || []);

        // Get recent sales (last 5)
        const recentSales = [...(data.sales || [])]
          .sort((a, b) => new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime())
          .slice(0, 5);

        return {
          totalSales: this.calculateTotalSales(data.sales || []),
          salesGrowth: this.calculateSalesGrowth(data.sales || [], currentMonth, currentYear),
          totalProducts: (data.products || []).length,
          lowStockItems: this.countLowStockItems(data.inventory || []),
          totalCustomers: (data.users || []).filter((user: any) => user.rol?.nombre === 'Cliente').length,
          newCustomers: this.countNewCustomers(data.users || [], currentMonth, currentYear),
          pendingOrders: (data.sales || []).filter((sale: any) => sale.estado === 'pendiente').length,
          completedOrders: (data.sales || []).filter((sale: any) => sale.estado === 'completada').length,
          monthlySales: monthlySales,
          recentSales: recentSales.map(sale => ({
            id: sale.id,
            customerName: sale.cliente?.nombre || 'Cliente no especificado',
            total: sale.total || 0,
            status: sale.estado || 'pendiente'
          }))
        };
      }),
      catchError(error => {
        console.error('Error in dashboard service:', error);
        // Return default data in case of error
        const defaultMonthlySales = this.getDefaultMonthlyData();
        return of({
          totalSales: 0,
          salesGrowth: 0,
          totalProducts: 0,
          lowStockItems: 0,
          totalCustomers: 0,
          newCustomers: 0,
          pendingOrders: 0,
          completedOrders: 0,
          monthlySales: defaultMonthlySales,
          recentSales: []
        });
      })
    );
  }

  // Helper method to safely make HTTP GET requests
  private safeGet(url: string): Observable<any> {
    return this.http.get(url).pipe(
      catchError(error => {
        console.error(`Error fetching ${url}:`, error);
        return of([]); // Return empty array if there's an error
      })
    );
  }

  private getDefaultMonthlyData() {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return months.map(month => ({ month, amount: 0 }));
  }

  // ... rest of your existing methods remain the same ...
  private calculateTotalSales(sales: any[]): number {
    return (sales || [])
      .filter(sale => sale.estado === 'completada')
      .reduce((sum, sale) => sum + parseFloat(sale.total || 0), 0);
  }

  private calculateSalesGrowth(sales: any[], currentMonth: number, currentYear: number): number {
    const currentMonthSales = this.getSalesForMonth(sales, currentMonth, currentYear);
    const previousMonthSales = this.getSalesForMonth(sales, currentMonth - 1, currentYear);

    if (previousMonthSales === 0) return 0;
    return ((currentMonthSales - previousMonthSales) / previousMonthSales) * 100;
  }

  private getSalesForMonth(sales: any[], month: number, year: number): number {
    return (sales || [])
      .filter(sale => {
        const saleDate = new Date(sale.fecha || 0);
        return saleDate.getMonth() === month &&
          saleDate.getFullYear() === year &&
          sale.estado === 'completada';
      })
      .reduce((sum, sale) => sum + parseFloat(sale.total || 0), 0);
  }

  private countLowStockItems(inventory: any[]): number {
    return (inventory || []).filter(item => item.cantidad <= item.stock_minimo).length;
  }

  private countNewCustomers(users: any[], currentMonth: number, currentYear: number): number {
    return (users || []).filter(user => {
      if (user.rol?.nombre !== 'Cliente') return false;
      const userDate = new Date(user.fecha_creacion || user.createdAt || 0);
      return userDate.getMonth() === currentMonth &&
        userDate.getFullYear() === currentYear;
    }).length;
  }

  private calculateMonthlySales(sales: any[]): any[] {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentYear = new Date().getFullYear();
    const monthlyData = new Array(12).fill(0).map((_, index) => ({
      month: months[index],
      amount: 0
    }));

    (sales || [])
      .filter(sale => {
        const saleDate = new Date(sale.fecha || 0);
        return saleDate.getFullYear() === currentYear && sale.estado === 'completada';
      })
      .forEach(sale => {
        const month = new Date(sale.fecha || 0).getMonth();
        monthlyData[month].amount += parseFloat(sale.total || 0);
      });

    return monthlyData;
  }
  getProducts(): Observable<any[]> {
    return this.safeGet(`${this.apiUrl}/products`);
  }

  getUsers(): Observable<any[]> {
    return this.safeGet(`${this.apiUrl}/users`);
  }

  getSales(): Observable<any[]> {
    return this.safeGet(`${this.apiUrl}/sales`);
  }

  getInventory(): Observable<any[]> {
    return this.safeGet(`${this.apiUrl}/inventory`);
  }
}