import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface OrderData {
  direccion_envio: string;
  ciudad_envio: string;
  pais_envio: string;
  telefono_contacto: string;
  tipo_pago: string;
  detalles: OrderDetail[];
}

export interface OrderDetail {
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
}

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
  private apiUrl = `${environment.apiUrl}/orders`; // http://localhost:3000/api/orders

  constructor(private http: HttpClient) { 
    console.log('🔗 OrderService initialized with API URL:', this.apiUrl);
  }

  /**
   * Crear nuevo pedido - FORMATO EXACTO DEL BACKEND
   * POST http://localhost:3000/api/orders
   * Authorization: Bearer {{token}}
   */
  createOrder(orderData: OrderData): Observable<any> {
    console.log('📦 Creating order...');
    console.log('🔗 URL:', this.apiUrl);
    console.log('📋 Data being sent:', JSON.stringify(orderData, null, 2));
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('📤 Making POST request to:', this.apiUrl);

    return this.http.post<any>(this.apiUrl, orderData, { headers }).pipe(
      tap(response => {
        console.log('✅ Order created successfully:', response);
      }),
      catchError((error) => {
        console.error('❌ Error creating order:', error);
        console.log('📊 Full error details:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          headers: error.headers,
          body: error.error
        });
        
        if (error.status === 0 || error.status === 404 || error.status === 500) {
          console.log('🔄 Server not available, returning error for user feedback');
          return throwError(() => ({
            status: error.status,
            message: `Error ${error.status}: Servidor no disponible`,
            originalError: error
          }));
        }
        
        if (error.status === 401) {
          console.log('🔐 Authentication error');
          return throwError(() => ({
            status: 401,
            message: 'Error de autenticación. Por favor inicia sesión nuevamente.',
            originalError: error
          }));
        }

        if (error.status === 400) {
          console.log('📝 Validation error');
          return throwError(() => ({
            status: 400,
            message: `Error de validación: ${error.error?.message || 'Datos inválidos'}`,
            originalError: error
          }));
        }
        
        return throwError(() => ({
          status: error.status || 500,
          message: error.error?.message || error.message || 'Error al procesar el pedido',
          originalError: error
        }));
      })
    );
  }

  /**
   * Obtener mis pedidos (para clientes)
   */
   getMyOrders(): Observable<any> {
    console.log('📋 Getting my orders from:', `${this.apiUrl}/my-orders`);
    
    return this.http.get<any>(`${this.apiUrl}/my-orders`).pipe(
      tap(response => {
        console.log('✅ Orders retrieved:', response);
      }),
      map(response => {
        // ✅ MAPEAR CAMPOS DE MAYÚSCULAS A MINÚSCULAS
        if (response && response.success && Array.isArray(response.data)) {
          const mappedData = response.data.map((order: any) => ({
            id_pedido: order.ID_PEDIDO,
            fecha_pedido: order.FECHA_PEDIDO,
            direccion_envio: order.DIRECCION_ENVIO,
            ciudad_envio: order.CIUDAD_ENVIO || '',
            pais_envio: order.PAIS_ENVIO || 'Guatemala',
            telefono_contacto: order.TELEFONO_CONTACTO || '',
            total: order.TOTAL,
            estado_pedido: order.ESTADO_PEDIDO,
            estado_pago: order.ESTADO_PAGO,
            tipo_pago: order.TIPO_PAGO,
            fecha_entrega_estimada: order.FECHA_ENTREGA_ESTIMADA,
            fecha_entrega_real: order.FECHA_ENTREGA_REAL,
            subtotal: order.SUBTOTAL || (order.TOTAL * 0.85), // Estimado si no viene
            iva: order.IVA || (order.TOTAL * 0.13), // Estimado si no viene
            costo_envio: order.COSTO_ENVIO || 10.00, // Default si no viene
            codigo_postal: order.CODIGO_POSTAL || '',
            observaciones: order.OBSERVACIONES || ''
          }));
          
          console.log('🔄 Mapped orders from backend format:', mappedData);
          
          return {
            ...response,
            data: mappedData
          };
        }
        
        return response;
      }),
      catchError((error) => {
        console.warn('🔄 Orders endpoint not available, returning empty data');
        return of({ 
          success: true, 
          data: [],
          message: 'No hay pedidos disponibles'
        });
      })
    );
  }

  /**
   * Obtener pedido por ID - CON MAPEO DE CAMPOS
   */
  getOrderById(orderId: number): Observable<any> {
    console.log('📋 Getting order by ID:', orderId);
    
    return this.http.get<any>(`${this.apiUrl}/${orderId}`).pipe(
      tap(response => {
        console.log('✅ Order detail retrieved:', response);
      }),
      map(response => {
        // Mapear campos si vienen en MAYÚSCULAS
        if (response && response.data && response.data.order) {
          const order = response.data.order;
          if (order.ID_PEDIDO) {
            // Mapear orden principal
            response.data.order = {
              id_pedido: order.ID_PEDIDO,
              fecha_pedido: order.FECHA_PEDIDO,
              direccion_envio: order.DIRECCION_ENVIO,
              ciudad_envio: order.CIUDAD_ENVIO || '',
              pais_envio: order.PAIS_ENVIO || 'Guatemala',
              telefono_contacto: order.TELEFONO_CONTACTO || '',
              total: order.TOTAL,
              estado_pedido: order.ESTADO_PEDIDO,
              estado_pago: order.ESTADO_PAGO,
              tipo_pago: order.TIPO_PAGO,
              fecha_entrega_estimada: order.FECHA_ENTREGA_ESTIMADA,
              subtotal: order.SUBTOTAL || (order.TOTAL * 0.85),
              iva: order.IVA || (order.TOTAL * 0.13),
              costo_envio: order.COSTO_ENVIO || 10.00,
              observaciones: order.OBSERVACIONES || ''
            };
          }
          
          // Mapear detalles si vienen en MAYÚSCULAS
          if (response.data.details && Array.isArray(response.data.details)) {
            response.data.details = response.data.details.map((detail: any) => ({
              id_detalle: detail.ID_DETALLE || detail.id_detalle,
              id_producto: detail.ID_PRODUCTO || detail.id_producto,
              nombre_producto: detail.NOMBRE_PRODUCTO || detail.nombre_producto,
              cantidad: detail.CANTIDAD || detail.cantidad,
              precio_unitario: detail.PRECIO_UNITARIO || detail.precio_unitario,
              descuento: detail.DESCUENTO || detail.descuento || 0,
              subtotal: detail.SUBTOTAL || detail.subtotal,
              imagen_url: detail.IMAGEN_URL || detail.imagen_url,
              categoria: detail.CATEGORIA || detail.categoria,
              marca: detail.MARCA || detail.marca
            }));
          }
        }
        
        return response;
      }),
      catchError((error) => {
        console.warn('🔄 Order detail not available, returning mock data');
        
        // Retornar datos mock específicos para el ID solicitado
        const mockOrder = {
          success: true,
          data: {
            order: {
              id_pedido: orderId,
              fecha_pedido: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              estado_pedido: 'PROCESANDO',
              estado_pago: 'C',
              direccion_envio: '12 Av. 15-25 Zona 10, Guatemala',
              ciudad_envio: 'Guatemala',
              pais_envio: 'Guatemala',
              telefono_contacto: '+502 2367-3000',
              tipo_pago: 'TARJETA_CREDITO',
              subtotal: 250.00,
              iva: 32.50,
              costo_envio: 10.00,
              total: 292.50,
              observaciones: 'Pedido de ejemplo - ID: ' + orderId
            },
            details: [
              {
                id_detalle: 1,
                id_producto: 101,
                nombre_producto: 'Adidas Balón Fútbol Oficial',
                cantidad: 1,
                precio_unitario: 120.00,
                descuento: 0,
                subtotal: 120.00,
                imagen_url: 'assets/productos/balon-futbol.jpg',
                categoria: 'Equipamiento',
                marca: 'Adidas'
              }
            ]
          },
          message: 'Datos de ejemplo para pedido ID: ' + orderId
        };
        
        return of(mockOrder);
      })
    );
  }

  /**
   * Obtener tracking de un pedido
   */
  getOrderTracking(orderId: number): Observable<any> {
    console.log('📍 Getting order tracking for:', orderId);
    
    return this.http.get<any>(`${this.apiUrl}/${orderId}/tracking`).pipe(
      tap(response => {
        console.log('✅ Tracking retrieved:', response);
      }),
      catchError((error) => {
        console.warn('🔄 Tracking not available, returning mock data');
        
        const mockTracking = {
          success: true,
          data: [
            {
              id_seguimiento: 1,
              id_pedido: orderId,
              estado: 'PEDIDO_RECIBIDO',
              descripcion: 'Pedido recibido y confirmado',
              fecha_hora: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              ubicacion: 'Centro de procesamiento - Guatemala'
            }
          ],
          message: 'Tracking de ejemplo para pedido ID: ' + orderId
        };
        
        return of(mockTracking);
      })
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
      'RECHAZADO': 'Rechazado',
      'PEDIDO_RECIBIDO': 'Pedido Recibido',
      'EN_PREPARACION': 'En Preparación',
      'LISTO_PARA_ENVIO': 'Listo para Envío'
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
      'RECHAZADO': 'status-rejected',
      'PEDIDO_RECIBIDO': 'status-received',
      'EN_PREPARACION': 'status-preparing',
      'LISTO_PARA_ENVIO': 'status-ready'
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
    return diasPorPais[pais] || 15;
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
}