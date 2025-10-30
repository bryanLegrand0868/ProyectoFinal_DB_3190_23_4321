import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Order {
  id_pedido: number;
  fecha_pedido: string;
  estado_pedido: string;
  estado_pago: string;
  direccion_envio: string;
  ciudad_envio: string;
  pais_envio: string;
  codigo_postal?: string;
  telefono_contacto: string;
  tipo_pago: string;
  subtotal: number;
  iva: number;
  costo_envio: number;
  total: number;
  fecha_entrega_estimada?: string;
  fecha_entrega_real?: string;
  observaciones?: string;
}

export interface OrderDetail {
  id_detalle: number;
  id_pedido: number;
  id_producto: number;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
  imagen_url?: string;
  categoria?: string;
  marca?: string;
}

export interface OrderTracking {
  id_seguimiento: number;
  id_pedido: number;
  estado: string;
  descripcion: string;
  fecha_hora: string;
  ubicacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) { }

  /**
   * Crear nuevo pedido
   */
  createOrder(orderData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, orderData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener mis pedidos (para clientes)
   */
  getMyOrders(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mis-pedidos`).pipe(
      catchError((error) => {
        console.warn('🔄 Orders endpoint not available, returning empty data');
        // Retornar datos vacíos en lugar de error
        return this.of({ success: true, data: [] });
      })
    );
  }

  private of(data: any): Observable<any> {
    return new Observable(observer => {
      observer.next(data);
      observer.complete();
    });
  }

  /**
   * Obtener pedido por ID
   */
  getOrderById(orderId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${orderId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener tracking de un pedido
   */
  getOrderTracking(orderId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${orderId}/tracking`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Cancelar pedido
   */
  cancelOrder(orderId: number, reason?: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${orderId}/cancel`, { reason }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualizar estado del pedido (para administradores)
   */
  updateOrderStatus(orderId: number, newStatus: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${orderId}/status`, { estado: newStatus }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Formatear estado del pedido para mostrar
   */
  formatEstadoPedido(estado: string): string {
    const estados: { [key: string]: string } = {
      'PENDIENTE': 'Pendiente',
      'PROCESANDO': 'En Proceso',
      'ENVIADO': 'Enviado',
      'ENTREGADO': 'Entregado',
      'CANCELADO': 'Cancelado',
      'RECHAZADO': 'Rechazado'
    };
    return estados[estado] || estado;
  }

  /**
   * Obtener clase CSS para el estado
   */
  getEstadoClass(estado: string): string {
    const classes: { [key: string]: string } = {
      'PENDIENTE': 'status-pending',
      'PROCESANDO': 'status-processing',
      'ENVIADO': 'status-shipped',
      'ENTREGADO': 'status-delivered',
      'CANCELADO': 'status-cancelled',
      'RECHAZADO': 'status-rejected'
    };
    return classes[estado] || 'status-default';
  }

  /**
   * Formatear estado de pago
   */
  formatEstadoPago(estado: string): string {
    const estados: { [key: string]: string } = {
      'P': 'Pendiente',
      'C': 'Completado',
      'R': 'Reembolsado',
      'F': 'Falló'
    };
    return estados[estado] || estado;
  }

  /**
   * Obtener clase CSS para estado de pago
   */
  getPaymentStatusClass(estado: string): string {
    const classes: { [key: string]: string } = {
      'P': 'payment-pending',
      'C': 'payment-completed',
      'R': 'payment-refunded',
      'F': 'payment-failed'
    };
    return classes[estado] || 'payment-default';
  }

  /**
   * Calcular días estimados de entrega
   */
  getEstimatedDeliveryDays(pais: string): number {
    const diasPorPais: { [key: string]: number } = {
      'Guatemala': 2,
      'El Salvador': 5,
      'Honduras': 7,
      'Nicaragua': 10,
      'Costa Rica': 8,
      'Panamá': 12
    };
    return diasPorPais[pais] || 15; // 15 días por defecto
  }

  /**
   * Calcular fecha estimada de entrega
   */
  calculateEstimatedDelivery(pais: string): Date {
    const days = this.getEstimatedDeliveryDays(pais);
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + days);
    return estimatedDate;
  }

  /**
   * Manejo de errores
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en OrderService:', error);
    return throwError(() => new Error(error.message || 'Error en el servidor'));
  }
}