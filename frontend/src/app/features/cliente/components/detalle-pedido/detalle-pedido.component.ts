import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService, OrderTracking } from '../../../../shared/services/order.service';

@Component({
  selector: 'app-detalle-pedido',
  templateUrl: './detalle-pedido.component.html',
  styleUrls: ['./detalle-pedido.component.css'],
  standalone: false
})
export class DetallePedidoComponent implements OnInit {
  orderId!: number;
  order: any = null;
  orderDetails: any[] = [];
  trackingHistory: OrderTracking[] = [];
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orderId = +params['id'];
      if (this.orderId) {
        this.loadOrderDetails();
        this.loadOrderTracking();
      }
    });
  }

  /**
   * Cargar detalles del pedido
   */
  loadOrderDetails(): void {
    this.loading = true;
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.order = response.data.order;
          this.orderDetails = response.data.details || [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar pedido:', error);
        this.loading = false;
        alert('Error - No se pudo cargar el detalle del pedido');
      }
    });
  }

  /**
   * Cargar tracking del pedido
   */
  loadOrderTracking(): void {
    this.orderService.getOrderTracking(this.orderId).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.trackingHistory = response.data || [];
        }
      },
      error: (error) => {
        console.error('Error al cargar tracking:', error);
      }
    });
  }

  /**
   * Volver a la lista de pedidos
   */
  goBack(): void {
    this.router.navigate(['/cliente/mis-pedidos']);
  }

  /**
   * Formatear estado
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
   * Calcular subtotal de un producto
   */
  getProductSubtotal(detail: any): number {
    return detail.cantidad * detail.precio_unitario - (detail.descuento || 0);
  }
}
