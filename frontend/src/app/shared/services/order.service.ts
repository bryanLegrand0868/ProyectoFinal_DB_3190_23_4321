import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OrderRequest {
  direccion_envio: string;
  ciudad_envio: string;
  pais_envio: string;
  codigo_postal?: string;
  telefono_contacto: string;
  tipo_pago: 'TARJETA_CREDITO' | 'TARJETA_DEBITO' | 'PAYPAL' | 'TRANSFERENCIA';
  detalles: {
    id_producto: number;
    cantidad: number;
    precio_unitario: number;
  }[];
}

export interface Order {
  id_pedido: number;
  fecha_pedido: string;
  direccion_envio: string;
  ciudad_envio: string;
  pais_envio: string;
  subtotal: number;
  costo_envio: number;
  iva: number;
  total: number;
  estado_pedido: 'PENDIENTE' | 'PROCESANDO' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO';
  estado_pago: 'P' | 'C' | 'R';
  tipo_pago: string;
  fecha_entrega_estimada?: string;
  fecha_entrega_real?: string;
}

export interface OrderTracking {
  id_seguimiento: number;
  fecha_hora: string;
  estado: string;
  descripcion: string;
  ubicacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) { }

  /**
   * Crear un nuevo pedido
   */
  createOrder(orderData: OrderRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, orderData);
  }

  /**
   * Obtener pedidos del cliente autenticado
   */
  getMyOrders(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my-orders`);
  }

  /**
   * Obtener detalles de un pedido específico
   */
  getOrderById(id_pedido: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id_pedido}`);
  }

  /**
   * Obtener tracking de un pedido
   */
  getOrderTracking(id_pedido: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id_pedido}/tracking`);
  }

  /**
   * Formatear estado de pedido para mostrar
   */
  formatEstadoPedido(estado: string): string {
    const estados: { [key: string]: string } = {
      'PENDIENTE': 'Pendiente',
      'PROCESANDO': 'En Proceso',
      'ENVIADO': 'Enviado',
      'ENTREGADO': 'Entregado',
      'CANCELADO': 'Cancelado'
    };
    return estados[estado] || estado;
  }

  /**
   * Formatear estado de pago
   */
  formatEstadoPago(estado: string): string {
    const estados: { [key: string]: string } = {
      'P': 'Pendiente',
      'C': 'Completado',
      'R': 'Reembolsado'
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
      'CANCELADO': 'status-cancelled'
    };
    return classes[estado] || 'status-default';
  }
}
