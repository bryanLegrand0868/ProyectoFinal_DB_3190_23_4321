import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { DashboardService } from '../../../../shared/services/dashboard.service';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: false,
  providers: [MessageService]
})
export class DashboardComponent implements OnInit {
  stats: any = {
    totalSales: 0,
    salesGrowth: 0,
    totalProducts: 0,
    lowStockItems: 0,
    totalCustomers: 0,
    newCustomers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    monthlySales: [],
    recentSales: []
  };

  salesData: any;
  chartOptions: any;
  loading = true;
  displayModal = false;
  modalTitle = '';
  modalData: any[] = [];
  modalColumns: any[] = [];
  loadingModal = false;

  constructor(
    private dashboardService: DashboardService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.initChartOptions();
    this.loadDashboardData();
  }

  initChartOptions() {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#495057'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#6c757d'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        y: {
          ticks: {
            color: '#6c757d'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      }
    };
  }

  loadDashboardData() {
    this.loading = true;
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.prepareChartData(data.monthlySales);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los datos del dashboard'
        });
        this.loading = false;
      }
    });
  }

  prepareChartData(monthlyData: any[]) {
    this.salesData = {
      labels: monthlyData.map(item => item.month),
      datasets: [
        {
          label: 'Ventas',
          data: monthlyData.map(item => item.amount),
          fill: false,
          borderColor: '#42A5F5',
          tension: 0.4
        }
      ]
    };
  }

  showProducts() {
    this.loadingModal = true;
    this.modalTitle = 'Lista de Productos';
    this.dashboardService.getProducts().subscribe({
      next: (data) => {
        this.modalData = data;
        this.modalColumns = [
          { field: 'id', header: 'ID' },
          { field: 'nombre', header: 'Nombre' },
          { field: 'descripcion', header: 'Descripción' },
          { field: 'precio', header: 'Precio', type: 'currency' },
          { field: 'stock', header: 'Stock' }
        ];
        this.displayModal = true;
        this.loadingModal = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los productos'
        });
        this.loadingModal = false;
      }
    });
  }

  showCustomers() {
    this.loadingModal = true;
    this.modalTitle = 'Lista de Clientes';
    this.dashboardService.getUsers().subscribe({
      next: (data) => {
        this.modalData = data.filter((user: any) => user.rol?.nombre === 'Cliente');
        this.modalColumns = [
          { field: 'id', header: 'ID' },
          { field: 'nombre', header: 'Nombre' },
          { field: 'email', header: 'Email' },
          { field: 'telefono', header: 'Teléfono' }
        ];
        this.displayModal = true;
        this.loadingModal = false;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los clientes'
        });
        this.loadingModal = false;
      }
    });
  }

  showOrders() {
    this.loadingModal = true;
    this.modalTitle = 'Pedidos Recientes';
    this.dashboardService.getSales().subscribe({
      next: (data) => {
        this.modalData = data;
        this.modalColumns = [
          { field: 'id', header: 'ID' },
          { field: 'cliente.nombre', header: 'Cliente' },
          { field: 'fecha', header: 'Fecha', type: 'date' },
          { field: 'total', header: 'Total', type: 'currency' },
          { field: 'estado', header: 'Estado', type: 'status' }
        ];
        this.displayModal = true;
        this.loadingModal = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los pedidos'
        });
        this.loadingModal = false;
      }
    });
  }

  showSales() {
    this.loadingModal = true;
    this.modalTitle = 'Ventas';
    this.dashboardService.getSales().subscribe({
      next: (data) => {
        this.modalData = data.filter((sale: any) => sale.estado === 'completada');
        this.modalData = this.modalData.map(sale => ({
          ...sale,
          fecha: new Date(sale.fecha).toLocaleDateString()
        }));
        this.modalColumns = [
          { field: 'id', header: 'ID' },
          { field: 'cliente.nombre', header: 'Cliente' },
          { field: 'fecha', header: 'Fecha' },
          { field: 'total', header: 'Total', type: 'currency' }
        ];
        this.displayModal = true;
        this.loadingModal = false;
      },
      error: (error) => {
        console.error('Error loading sales:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las ventas'
        });
        this.loadingModal = false;
      }
    });
  }

  // Helper method to get nested properties
  getNestedValue(data: any, field: string): any {
    return field.split('.').reduce((obj, key) => (obj && obj[key] !== undefined) ? obj[key] : '', data);
  }

  // Format cell value based on type
  formatCellValue(rowData: any, field: string, type?: string): any {
    const value = this.getNestedValue(rowData, field);

    if (value === undefined || value === null) return '';

    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN'
        }).format(parseFloat(value));
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'status':
        return this.formatStatus(value);
      default:
        return value;
    }
  }

  formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'completada': 'Completada',
      'cancelada': 'Cancelada'
    };
    return statusMap[status.toLowerCase()] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }
  getFilterFields(): string[] {
    return this.modalColumns ? this.modalColumns.map(col => col.field) : [];
  }
}