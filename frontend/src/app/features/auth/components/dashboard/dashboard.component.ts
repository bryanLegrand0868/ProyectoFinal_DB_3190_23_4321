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
    monthlySales: this.getDefaultMonthlyData(),
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
    console.log('📊 Dashboard initializing...');
    this.initChartOptions();
    this.loadCountry();
    this.setupChartOptions();
    this.loadDashboardData();
  }

  /**
   * Obtener datos mensuales por defecto
   */
  private getDefaultMonthlyData() {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return months.map(month => ({ month, amount: 0 }));
  }

  loadCountry() {
    try {
      const saved = localStorage.getItem('selectedCountry');
      if (saved) {
        const country = JSON.parse(saved);
        this.selectedCountry = country.code;
      }
    } catch (error) {
      console.error('Error loading country:', error);
      this.selectedCountry = 'GT';
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
    console.log('📈 Loading dashboard data...');
    this.loading = true;
    
    // Usar datos por defecto mientras se cargan los reales
    this.prepareChartData(this.stats.monthlySales);
    
    this.dashboardService.getDashboardStats().subscribe({
      next: (response: any) => {
        console.log('✅ Dashboard data loaded:', response);
        
        if (response && response.success) {
          this.stats = {
            ...this.stats,
            ...response.data
          };
          
          if (response.data.monthlySales) {
            this.setupSalesChart(response.data.monthlySales);
          }
        } else {
          console.warn('⚠️ Dashboard response without success flag');
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading dashboard data:', error);
        
        // Mostrar datos por defecto en caso de error
        this.loading = false;
        
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'Usando datos por defecto. Verifique la conexión al servidor.',
          life: 5000
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
    if (!monthlyData || !Array.isArray(monthlyData)) {
      monthlyData = this.getDefaultMonthlyData();
    }

    this.salesData = {
      labels: monthlyData.map(item => {
        if (typeof item.month === 'string') {
          return item.month;
        }
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return monthNames[new Date(item.month).getMonth()] || 'Mes';
      }),
      datasets: [{
        label: 'Ventas Mensuales (Q)',
        data: monthlyData.map(item => item.amount || 0),
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
    if (!monthlyData || !Array.isArray(monthlyData)) {
      monthlyData = this.getDefaultMonthlyData();
    }

    this.salesData = {
      labels: monthlyData.map(item => item.month || 'Mes'),
      datasets: [
        {
          label: 'Ventas Mensuales (Q)',
          data: monthlyData.map(item => item.amount || 0),
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

  // Métodos de carga con manejo mejorado de errores
  loadProducts() {
    this.loadModalData('Productos', () => this.dashboardService.getProducts(), this.setupProductColumns.bind(this));
  }

  loadClients() {
    this.loadModalData('Clientes', () => this.dashboardService.getClients(), this.setupClientColumns.bind(this));
  }

  loadSales() {
    this.loadModalData('Ventas', () => this.dashboardService.getSales(), this.setupSalesColumns.bind(this));
  }

  showOrders() {
    this.loadModalData('Pedidos Recientes', () => this.dashboardService.getSales(), () => {
      this.modalColumns = [
        { field: 'id_venta', header: 'ID' },
        { field: 'nombre_cliente', header: 'Cliente' },
        { field: 'fecha_venta', header: 'Fecha', type: 'date' },
        { field: 'total', header: 'Total', type: 'currency' },
        { field: 'estado_pago', header: 'Estado', type: 'status' }
      ];
    });
  }

  /**
   * Método genérico para cargar datos en modal
   */
  private loadModalData(title: string, dataLoader: () => any, columnSetup: () => void) {
    this.loadingModal = true;
    this.modalTitle = title;
    
    dataLoader().subscribe({
      next: (response: any) => {
        this.modalData = this.extractDataFromResponse(response);
        columnSetup();
        this.displayModal = true;
        this.loadingModal = false;
      },
      error: (error: any) => {
        console.error(`Error loading ${title.toLowerCase()}:`, error);
        this.loadingModal = false;
        this.modalData = [];
        this.displayModal = true;
        columnSetup();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `No se pudieron cargar ${title.toLowerCase()}`
        });
      }
    });
  }

  /**
   * Extraer datos de la respuesta
   */
  private extractDataFromResponse(response: any): any[] {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (response.success && Array.isArray(response.data)) return response.data;
    if (response.data) return Array.isArray(response.data) ? response.data : [response.data];
    return [];
  }

  setupProductColumns() {
    this.modalColumns = [
      { field: 'id_producto', header: 'ID', width: '80px' },
      { field: 'nombre', header: 'Producto' },
      { field: 'nombre_categoria', header: 'Categoría' },
      { field: 'precio_venta', header: 'Precio', type: 'currency' },
      { field: 'estado', header: 'Estado', type: 'status', width: '120px' }
    ];
  }

  setupClientColumns() {
    this.modalColumns = [
      { field: 'ID_USUARIO', header: 'ID', width: '80px' },
      { field: 'USUARIO', header: 'Usuario' },
      { field: 'NOMBRE_ROL', header: 'Rol' },
      { field: 'FECHA_CREACION', header: 'Fecha Creación', type: 'date' },
      { field: 'ESTADO', header: 'Estado', type: 'status', width: '120px' }
    ];
  }

  setupSalesColumns() {
    this.modalColumns = [
      { field: 'id_venta', header: 'ID' },
      { field: 'nombre_cliente', header: 'Cliente' },
      { field: 'fecha_venta', header: 'Fecha', type: 'date' },
      { field: 'total', header: 'Total', type: 'currency' },
      { field: 'estado_pago', header: 'Estado', type: 'status' }
    ];
  }

  // Métodos de utilidad existentes...
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