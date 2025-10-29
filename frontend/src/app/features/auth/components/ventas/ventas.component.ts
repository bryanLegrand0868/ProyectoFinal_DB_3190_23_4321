import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { environment } from '../../../../../environments/environment';

interface SaleDetail {
  id_producto: number;
  nombre_producto?: string;
  cantidad: number;
  precio_unitario: number;
}

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css'],
  standalone: false,
  providers: [MessageService]
})
export class VentasComponent implements OnInit {
  ventas: any[] = [];
  productos: any[] = [];
  clientes: any[] = [];
  loading = false;
  displayDialog = false;
  productoBuscado: string = '';
  productosFiltrados: any[] = [];

  // Nueva Venta
  nuevaVenta: any = {
    id_cliente: null,
    id_sucursal: null,
    detalles: []
  };

  selectedProducto: any = null;
  cantidad: number = 1;

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.loadVentas();
    this.loadProductos();
    this.loadClientes();
  }

  loadVentas() {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/sales`).subscribe({
      next: (response) => {
        this.ventas = response.success ? response.data : [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading sales:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las ventas'
        });
        this.loading = false;
      }
    });
  }

  loadProductos() {
    this.http.get<any>(`${this.apiUrl}/products`).subscribe({
      next: (response) => {
        this.productos = response.success ? response.data : [];
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }
  buscarProducto() {
    if (this.productoBuscado.trim() === '') {
      this.productosFiltrados = [];
      return;
    }
    this.productosFiltrados = this.productos.filter(p =>
      p.nombre.toLowerCase().includes(this.productoBuscado.toLowerCase())
    );
  }

  seleccionarProducto(producto: any) {
    this.selectedProducto = producto;
    this.productoBuscado = producto.nombre;
    this.productosFiltrados = [];
  }

  loadClientes() {
    this.http.get<any>(`${this.apiUrl}/users`).subscribe({
      next: (response) => {
        // Filtrar solo clientes
        const allUsers = response.success ? response.data : [];
        this.clientes = allUsers.filter((u: any) => u.NOMBRE_ROL === 'Cliente');
      },
      error: (error) => {
        console.error('Error loading clients:', error);
      }
    });
  }

  showNewSaleDialog() {
    this.nuevaVenta = {
      id_cliente: null,
      id_sucursal: 1, // Por defecto
      detalles: []
    };
    this.displayDialog = true;
  }

  agregarProducto() {
    if (!this.selectedProducto || this.cantidad <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar un producto y cantidad válida'
      });
      return;
    }

    const detalle: SaleDetail = {
      id_producto: this.selectedProducto.id_producto,
      nombre_producto: this.selectedProducto.nombre,
      cantidad: this.cantidad,
      precio_unitario: this.selectedProducto.precio_venta
    };

    this.nuevaVenta.detalles.push(detalle);
    this.selectedProducto = null;
    this.cantidad = 1;

    this.messageService.add({
      severity: 'success',
      summary: 'Producto agregado',
      detail: 'Producto agregado al carrito'
    });
  }

  eliminarDetalle(index: number) {
    this.nuevaVenta.detalles.splice(index, 1);
  }

  calcularSubtotal(): number {
    return this.nuevaVenta.detalles.reduce((sum: number, d: SaleDetail) =>
      sum + (d.cantidad * d.precio_unitario), 0
    );
  }

  calcularIVA(): number {
    return this.calcularSubtotal() * 0.13;
  }

  calcularTotal(): number {
    return this.calcularSubtotal() + this.calcularIVA();
  }

  registrarVenta() {
    if (this.nuevaVenta.detalles.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe agregar al menos un producto'
      });
      return;
    }

    const ventaData = {
      id_cliente: this.nuevaVenta.id_cliente,
      id_sucursal: this.nuevaVenta.id_sucursal,
      detalles: this.nuevaVenta.detalles.map((d: SaleDetail) => ({
        id_producto: d.id_producto,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario
      }))
    };

    this.loading = true;
    this.http.post(`${this.apiUrl}/sales`, ventaData).subscribe({
      next: (response: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Venta registrada correctamente'
        });
        this.displayDialog = false;
        this.loadVentas();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error registrando venta:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo registrar la venta'
        });
        this.loading = false;
      }
    });
  }

  exportExcel() {
    this.http.get(`${this.apiUrl}/reports/sales?format=excel`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ventas.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error al exportar:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo exportar el reporte'
        });
      }
    });
  }

  exportPdf() {
    this.http.get(`${this.apiUrl}/reports/sales?format=pdf`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ventas.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error al exportar:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo exportar el reporte'
        });
      }
    });
  }
}