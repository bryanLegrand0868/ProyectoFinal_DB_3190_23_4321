import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../../shared/services/dashboard.service';
import { MessageService } from 'primeng/api';
import * as XLSX from 'xlsx';

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
  loading: boolean = true;
  displayModal: boolean = false;
  modalTitle: string = '';
  modalData: any[] = [];
  modalColumns: any[] = [];
  loadingModal: boolean = false;
  filters: any = {};
  selectedCountry: string = 'GT';

  constructor(
    private dashboardService: DashboardService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.initChartOptions();
    this.loadCountry();
    this.setupChartOptions();
    this.loadDashboardData();
  }

  loadCountry() {
    const saved = localStorage.getItem('selectedCountry');
    if (saved) {
      const country = JSON.parse(saved);
      this.selectedCountry = country.code;
    }
  }

  initChartOptions() {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#495057',
            font: { size: 12, weight: 600 }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#667eea',
          borderWidth: 1,
          padding: 12,
          displayColors: false
        }
      },
      scales: {
        x: {
          ticks: { color: '#6c757d', font: { size: 11 } },
          grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false }
        },
        y: {
          ticks: { color: '#6c757d', font: { size: 11 } },
          grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false }
        }
      }
    };
  }

loadDashboardData() {
  this.loading = true;
  this.dashboardService.getDashboardStats().subscribe({
    next: (response: any) => {
      if (response && response.success) {
        this.stats = response.data;
        this.setupSalesChart(response.data.monthlySales);
      }
      this.loading = false;
    },
    error: (error) => {
      console.error('Error loading dashboard data:', error);
      this.loading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los datos del dashboard'
      });
    }
  });
}

  setupChartOptions() {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              return `Q${context.raw.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value: any) => `Q${value.toLocaleString()}`
          }
        }
      }
    };
  }
  setupSalesChart(monthlyData: any[]) {
    this.salesData = {
      labels: monthlyData.map(item => {
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return monthNames[new Date(item.month).getMonth()];
      }),
      datasets: [{
        label: 'Ventas Mensuales (Q)',
        data: monthlyData.map(item => item.amount),
        fill: true,
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderColor: '#667eea',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#667eea',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    };
  }

  prepareChartData(monthlyData: any[]) {
    this.salesData = {
      labels: monthlyData.map(item => item.month),
      datasets: [
        {
          label: 'Ventas Mensuales (Q)',
          data: monthlyData.map(item => item.amount),
          fill: true,
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderColor: '#667eea',
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#667eea',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }
      ]
    };
  }

  loadProducts() {
    this.loadingModal = true;
    this.modalTitle = 'Productos';
    this.dashboardService.getProducts().subscribe({
      next: (response: any) => {
        this.modalData = response.success ? response.data : [];
        this.setupProductColumns();
        this.displayModal = true;
        this.loadingModal = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loadingModal = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los productos'
        });
      }
    });
  }

  loadClients() {
    this.loadingModal = true;
    this.modalTitle = 'Clientes';
    this.dashboardService.getClients().subscribe({
      next: (response: any) => {
        this.modalData = response.success ? response.data : [];
        this.setupClientColumns();
        this.displayModal = true;
        this.loadingModal = false;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.loadingModal = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los clientes'
        });
      }
    });
  }

  loadSales() {
    this.loadingModal = true;
    this.modalTitle = 'Ventas';
    this.dashboardService.getSales().subscribe({
      next: (response: any) => {
        this.modalData = response.success ? response.data : [];
        this.setupSalesColumns();
        this.displayModal = true;
        this.loadingModal = false;
      },
      error: (error) => {
        console.error('Error loading sales:', error);
        this.loadingModal = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las ventas'
        });
      }
    });
  }

  setupProductColumns() {
    this.modalColumns = [
      { field: 'id_producto', header: 'ID', width: '80px' },
      { field: 'nombre', header: 'Producto' },
      { field: 'nombre_categoria', header: 'Categoría' },
      {
        field: 'precio_venta',
        header: 'Precio',
        type: 'currency'
      },
      {
        field: 'estado',
        header: 'Estado',
        type: 'status',
        width: '120px'
      }
    ];
  }

  setupClientColumns() {
    this.modalColumns = [
      { field: 'ID_USUARIO', header: 'ID', width: '80px' },
      { field: 'USUARIO', header: 'Usuario' },
      { field: 'NOMBRE_ROL', header: 'Rol' },
      {
        field: 'FECHA_CREACION',
        header: 'Fecha Creación',
        type: 'date'
      },
      {
        field: 'ESTADO',
        header: 'Estado',
        type: 'status',
        width: '120px'
      }
    ];
  }

  setupSalesColumns() {
    this.modalColumns = [
      { field: 'id_venta', header: 'ID' },
      { field: 'nombre_cliente', header: 'Cliente' },
      {
        field: 'fecha_venta',
        header: 'Fecha',
        type: 'date'
      },
      {
        field: 'total',
        header: 'Total',
        type: 'currency'
      },
      {
        field: 'estado_pago',
        header: 'Estado',
        type: 'status'
      }
    ];
  }

  showOrders() {
    this.loadingModal = true;
    this.modalTitle = 'Pedidos Recientes';
    this.dashboardService.getSales().subscribe({
      next: (response: any) => {
        const ordersData = response && response.success ? response.data : [];
        this.modalData = Array.isArray(ordersData) ? ordersData : [];
        this.modalColumns = [
          { field: 'id_venta', header: 'ID' },
          { field: 'nombre_cliente', header: 'Cliente' },
          { field: 'fecha_venta', header: 'Fecha', type: 'date' },
          { field: 'total', header: 'Total', type: 'currency' },
          { field: 'estado_pago', header: 'Estado', type: 'status' }
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

  getNestedValue(data: any, field: string): any {
    if (!data) return null;
    return field.split('.').reduce((obj, key) =>
      (obj && obj[key] !== 'undefined') ? obj[key] : null, data
    );
  }

  onFilter(event: any, field: string) {
    if (!this.filters[field]) {
      this.filters[field] = { value: '' };
    }
    this.filters[field].value = event.target.value;
  }

  formatCellValue(rowData: any, field: string, type?: string): any {
    const value = this.getNestedValue(rowData, field);
    if (value === undefined || value === null) return '';

    switch (type) {
      case 'currency':
        return `Q${parseFloat(value).toFixed(2)}`;
      case 'date':
        return new Date(value).toLocaleDateString('es-GT');
      case 'status':
        return this.formatStatus(value);
      default:
        return value;
    }
  }

  formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'A': 'Activo',
      'I': 'Inactivo',
      'P': 'Pendiente',
      'C': 'Completado'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'A': 'status-active',
      'I': 'status-inactive',
      'P': 'status-pending',
      'C': 'status-completed'
    };
    return classes[status] || '';
  }

  getFilterFields(): string[] {
    return this.modalColumns.map(col => col.field);
  }

  exportToExcel(): void {
    try {
      setTimeout(() => {
        const element = document.getElementById('exportTable');
        if (!element) {
          throw new Error('No se pudo encontrar la tabla para exportar');
        }

        const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Datos');

        const fileName = `reporte_${this.modalTitle.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Archivo exportado correctamente'
        });
      }, 0);
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo exportar el archivo'
      });
    }
  }
}