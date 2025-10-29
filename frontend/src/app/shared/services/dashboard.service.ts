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
    return forkJoin({
      products: this.getProducts(),
      sales: this.getSales(),
      users: this.getClients()
    }).pipe(
      map(({ products, sales, users }) => {
        // Filter only clients
        const clients = users.data.filter((user: any) => user.NOMBRE_ROL === 'Cliente');
        
        // Calculate total sales
        const totalSales = sales.data.reduce((sum: number, sale: any) => sum + (parseFloat(sale.total) || 0), 0);
        
        // Get current month and year for calculations
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        // Calculate monthly sales
        const monthlySales = this.calculateMonthlySales(sales.data);
        
        // Get recent sales (last 5)
        const recentSales = [...sales.data]
          .sort((a: any, b: any) => 
            new Date(b.fecha_venta).getTime() - new Date(a.fecha_venta).getTime()
          )
          .slice(0, 5);

        // Calculate sales growth (simple comparison with previous month)
        const previousMonthSales = this.getSalesForMonth(sales.data, 
          currentMonth === 0 ? 11 : currentMonth - 1, 
          currentMonth === 0 ? currentYear - 1 : currentYear
        );
        const currentMonthSales = this.getSalesForMonth(sales.data, currentMonth, currentYear);
        const salesGrowth = previousMonthSales > 0 
          ? ((currentMonthSales - previousMonthSales) / previousMonthSales) * 100 
          : 0;

        // Count new customers (this month)
        const newCustomers = clients.filter((client: any) => {
          const createdDate = new Date(client.FECHA_CREACION);
          return createdDate.getMonth() === currentMonth && 
                 createdDate.getFullYear() === currentYear;
        }).length;

        return {
          success: true,
          data: {
            totalSales: totalSales,
            salesGrowth: parseFloat(salesGrowth.toFixed(2)),
            totalProducts: products.data.length,
            lowStockItems: products.data.filter((p: any) => p.stock < 10).length, // Assuming there's a stock field
            totalCustomers: clients.length,
            newCustomers: newCustomers,
            pendingOrders: sales.data.filter((s: any) => s.estado_pago === 'P').length,
            completedOrders: sales.data.filter((s: any) => s.estado_pago === 'C').length,
            monthlySales: monthlySales,
            recentSales: recentSales
          }
        };
      })
    );
  }

  private calculateMonthlySales(sales: any[]): any[] {
    const monthlyData: {[key: string]: number} = {};
    
    // Initialize all months with 0
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentYear = new Date().getFullYear();
    
    monthNames.forEach((month, index) => {
      monthlyData[month] = 0;
    });

    // Sum sales by month
    sales.forEach(sale => {
      if (!sale.fecha_venta) return;
      
      const saleDate = new Date(sale.fecha_venta);
      if (saleDate.getFullYear() === currentYear) {
        const monthName = monthNames[saleDate.getMonth()];
        monthlyData[monthName] += parseFloat(sale.total) || 0;
      }
    });

    // Convert to array format
    return Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount
    }));
  }

  private getSalesForMonth(sales: any[], month: number, year: number): number {
    return sales.reduce((sum, sale) => {
      if (!sale.fecha_venta) return sum;
      
      const saleDate = new Date(sale.fecha_venta);
      if (saleDate.getMonth() === month && saleDate.getFullYear() === year) {
        return sum + (parseFloat(sale.total) || 0);
      }
      return sum;
    }, 0);
  }

  getProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/products`);
  }

  getClients(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  getSales(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sales`);
  }
}