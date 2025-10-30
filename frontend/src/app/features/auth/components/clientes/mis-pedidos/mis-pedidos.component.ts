import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Order, OrderService } from '../../../../../shared/services/order.service';

@Component({
  selector: 'app-mis-pedidos',
  templateUrl: './mis-pedidos.component.html',
  styleUrls: ['./mis-pedidos.component.css'],
  standalone: false
})
export class MisPedidosComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading: boolean = false;
  selectedStatus: string = 'TODOS';

  statusOptions = [
    { label: 'Todos', value: 'TODOS' },
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'En Proceso', value: 'PROCESANDO' },
    { label: 'Enviado', value: 'ENVIADO' },
    { label: 'Entregado', value: 'ENTREGADO' },
    { label: 'Cancelado', value: 'CANCELADO' }
  ];

  constructor(
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  /**
   * Cargar pedidos
   */
  loadOrders(): void {
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.orders = response.data || [];
          this.applyFilter();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar pedidos:', error);
        this.loading = false;
        alert('Error - No se pudieron cargar los pedidos');
      }
    });
  }

  /**
   * Aplicar filtro por estado
   */
  applyFilter(): void {
    if (this.selectedStatus === 'TODOS') {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(
        order => order.estado_pedido === this.selectedStatus
      );
    }
  }

  /**
   * Cambiar filtro
   */
  onFilterChange(): void {
    this.applyFilter();
  }

  /**
   * Ver detalle del pedido
   */
  viewOrderDetail(orderId: number): void {
    this.router.navigate(['/cliente/pedido', orderId]);
  }

  /**
   * Formatear estado de pedido
   */
  formatEstado(estado: string): string {
    return this.orderService.formatEstadoPedido(estado);
  }

  /**
   * Obtener clase CSS para el estado
   */
  getEstadoClass(estado: string): string {
    return this.orderService.getEstadoClass(estado);
  }

  /**
   * Formatear estado de pago
   */
  formatEstadoPago(estado: string): string {
    return this.orderService.formatEstadoPago(estado);
  }

  /**
   * Obtener clase del badge de pago
   */
  getPagoBadgeClass(estado: string): string {
    const classes: { [key: string]: string } = {
      'P': 'badge-pending',
      'C': 'badge-completed',
      'R': 'badge-refunded'
    };
    return classes[estado] || 'badge-default';
  }

  /**
   * Continuar comprando
   */
  continueShopping(): void {
    this.router.navigate(['/cliente/productos']);
  }
}