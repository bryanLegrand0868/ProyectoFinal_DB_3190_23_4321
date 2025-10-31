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
    console.log('📋 Loading orders...');
    
    this.orderService.getMyOrders().subscribe({
      next: (response: any) => {
        console.log('✅ Orders response received:', response);
        
        if (response && response.success && Array.isArray(response.data)) {
          this.orders = response.data;
          console.log('📋 Orders loaded:', this.orders.length, 'orders');
          console.log('📋 First order sample:', this.orders[0]);
          this.applyFilter();
        } else {
          console.warn('⚠️ Unexpected response structure:', response);
          this.orders = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading orders:', error);
        this.loading = false;
        this.orders = [];
        alert('Error - No se pudieron cargar los pedidos: ' + (error.message || 'Error desconocido'));
      }
    });
  }

  /**
   * Aplicar filtro por estado
   */
  applyFilter(): void {
    console.log('🔍 Applying filter:', this.selectedStatus);
    
    if (this.selectedStatus === 'TODOS') {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(
        order => order.estado_pedido === this.selectedStatus
      );
    }
    
    console.log('🔍 Filtered orders:', this.filteredOrders.length);
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
    console.log('👁️ Viewing order detail for ID:', orderId);
    
    if (!orderId) {
      console.error('❌ Invalid order ID:', orderId);
      alert('Error: ID de pedido inválido');
      return;
    }
    
    this.router.navigate(['/tienda/pedido', orderId]);
  }

  /**
   * Formatear estado de pedido
   */
  formatEstado(estado: string): string {
    if (!estado) return 'Sin estado';
    return this.orderService.formatEstadoPedido(estado);
  }

  /**
   * Obtener clase CSS para el estado
   */
  getEstadoClass(estado: string): string {
    if (!estado) return 'status-default';
    return this.orderService.getEstadoClass(estado);
  }

  /**
   * Formatear estado de pago
   */
  formatEstadoPago(estado: string): string {
    if (!estado) return 'Sin estado';
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
   * Formatear tipo de pago de forma segura
   */
  formatTipoPago(tipoPago: string): string {
    if (!tipoPago) return 'No especificado';
    
    // Reemplazar guiones bajos con espacios de forma segura
    return tipoPago.replace(/_/g, ' ');
  }

  /**
   * Formatear fecha de forma segura
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-GT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha inválida';
    }
  }

  /**
   * Formatear precio de forma segura
   */
  formatPrice(price: number): string {
    if (typeof price !== 'number' || isNaN(price)) return 'Q0.00';
    return `Q${price.toFixed(2)}`;
  }

  /**
   * Verificar si hay pedidos
   */
  hasOrders(): boolean {
    return this.orders && this.orders.length > 0;
  }

  /**
   * Verificar si hay pedidos filtrados
   */
  hasFilteredOrders(): boolean {
    return this.filteredOrders && this.filteredOrders.length > 0;
  }

  /**
   * Continuar comprando
   */
  continueShopping(): void {
    console.log('🛍️ Navigating to products catalog');
    this.router.navigate(['/tienda/catalogo']);
  }

  /**
   * Recargar pedidos
   */
  refreshOrders(): void {
    console.log('🔄 Refreshing orders');
    this.loadOrders();
  }
}