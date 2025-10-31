import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService, OrderTracking } from '../../../../../shared/services/order.service';

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
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    console.log('📋 DetallePedidoComponent initialized');
    
    this.route.params.subscribe(params => {
      this.orderId = +params['id'];
      console.log('📋 Loading order details for ID:', this.orderId);
      
      if (this.orderId && this.orderId > 0) {
        this.loadOrderDetails();
        this.loadOrderTracking();
      } else {
        console.error('❌ Invalid order ID:', this.orderId);
        this.error = 'ID de pedido inválido';
      }
    });
  }

  /**
   * Cargar detalles del pedido
   */
  loadOrderDetails(): void {
    this.loading = true;
    this.error = '';
    
    console.log('📋 Loading order details for ID:', this.orderId);
    
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (response: any) => {
        console.log('✅ Order details response:', response);
        
        try {
          if (response && response.success && response.data) {
            this.order = response.data.order;
            this.orderDetails = response.data.details || [];
            
            console.log('📋 Order loaded:', this.order);
            console.log('📋 Order details loaded:', this.orderDetails);
          } else if (response && response.data) {
            // Manejo alternativo si la estructura es diferente
            this.order = response.data;
            this.orderDetails = response.details || [];
          } else {
            console.warn('⚠️ Unexpected response structure:', response);
            this.error = 'Estructura de respuesta inesperada';
          }
        } catch (error) {
          console.error('❌ Error processing order data:', error);
          this.error = 'Error al procesar los datos del pedido';
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading order details:', error);
        this.loading = false;
        this.error = error.message || 'No se pudo cargar el detalle del pedido';
        
        // No mostrar alert, solo mostrar el error en la UI
      }
    });
  }

  /**
   * Cargar tracking del pedido
   */
  loadOrderTracking(): void {
    console.log('📍 Loading tracking for order ID:', this.orderId);
    
    this.orderService.getOrderTracking(this.orderId).subscribe({
      next: (response: any) => {
        console.log('✅ Tracking response:', response);
        
        try {
          if (response && response.success && response.data) {
            this.trackingHistory = response.data;
            console.log('📍 Tracking loaded:', this.trackingHistory);
          } else if (response && Array.isArray(response)) {
            // Manejo alternativo si viene directamente un array
            this.trackingHistory = response;
          } else {
            console.warn('⚠️ No tracking data available');
            this.trackingHistory = [];
          }
        } catch (error) {
          console.error('❌ Error processing tracking data:', error);
          this.trackingHistory = [];
        }
      },
      error: (error) => {
        console.error('❌ Error loading tracking:', error);
        this.trackingHistory = [];
        // No es crítico si falla el tracking
      }
    });
  }

  /**
   * Volver a la lista de pedidos
   */
  goBack(): void {
    console.log('🔙 Navigating back to orders list');
    // ✅ CORREGIDO: Usar la ruta correcta
    this.router.navigate(['/tienda/mis-pedidos']);
  }

  /**
   * Formatear estado
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
   * Obtener clase CSS para estado de pago
   */
  getPaymentStatusClass(estado: string): string {
    if (!estado) return 'payment-default';
    return this.orderService.getPaymentStatusClass(estado);
  }

  /**
   * Calcular subtotal de un producto
   */
  getProductSubtotal(detail: any): number {
    if (!detail) return 0;
    
    const cantidad = detail.cantidad || 0;
    const precio = detail.precio_unitario || 0;
    const descuento = detail.descuento || 0;
    
    return cantidad * precio - descuento;
  }

  /**
   * Formatear fecha
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-GT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha inválida';
    }
  }

  /**
   * Formatear precio
   */
  formatPrice(price: number): string {
    if (typeof price !== 'number') return 'Q0.00';
    
    return `Q${price.toFixed(2)}`;
  }

  /**
   * Verificar si hay datos del pedido
   */
  hasOrderData(): boolean {
    return !!(this.order && Object.keys(this.order).length > 0);
  }

  /**
   * Verificar si hay detalles del pedido
   */
  hasOrderDetails(): boolean {
    return !!(this.orderDetails && this.orderDetails.length > 0);
  }

  /**
   * Verificar si hay tracking
   */
  hasTracking(): boolean {
    return !!(this.trackingHistory && this.trackingHistory.length > 0);
  }

  /**
   * Intentar recargar los datos
   */
  retryLoad(): void {
    console.log('🔄 Retrying to load order data');
    this.error = '';
    this.loadOrderDetails();
    this.loadOrderTracking();
  }
}