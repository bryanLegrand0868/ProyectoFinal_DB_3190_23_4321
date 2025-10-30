import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Producto {
  id_producto?: number;
  nombre: string;
  descripcion?: string;
  precio_venta: number;
  stock: number;
  categoria?: string;
  marca?: string;
  sku?: string;
  imagen_url?: string;
}

export interface Pedido {
  id_pedido?: number;
  id_cliente: number;
  fecha_pedido?: Date;
  estado_pedido?: string;
  estado_pago?: string;
  total: number;
  subtotal: number;
  iva: number;
  costo_envio: number;
  direccion_envio: string;
  ciudad_envio: string;
  pais_envio: string;
  telefono_contacto: string;
  tipo_pago: string;
  fecha_entrega_estimada?: Date;
  fecha_entrega_real?: Date;
}

export interface DetallePedido {
  id_detalle_pedido?: number;
  id_pedido: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  descuento?: number;
  nombre_producto?: string;
  categoria?: string;
  marca?: string;
  imagen_url?: string;
}

export interface Seguimiento {
  id_seguimiento?: number;
  id_pedido: number;
  estado: string;
  descripcion: string;
  fecha_hora: Date;
  ubicacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Obtener todos los productos con filtros opcionales
  getProductos(filtros?: any): Observable<Producto[]> {
    let params = new HttpParams();

    // Agregar filtros a los parámetros de la URL si existen
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== null && filtros[key] !== undefined) {
          params = params.append(key, filtros[key].toString());
        }
      });
    }

    return this.http.get<{success: boolean, data: Producto[]}>(`${this.apiUrl}/products`, { params })
      .pipe(
        map(response => response.data || [])
      );
  }

  // Obtener un producto por su ID
  getProductoPorId(id: number): Observable<Producto> {
    return this.http.get<{success: boolean, data: Producto}>(`${this.apiUrl}/products/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

  // Buscar productos por nombre o descripción
  buscarProductos(query: string): Observable<Producto[]> {
    const params = new HttpParams().set('search', query);

    return this.http.get<{success: boolean, data: Producto[]}>(`${this.apiUrl}/products/search`, { params })
      .pipe(
        map(response => response.data || [])
      );
  }

  // Crear un nuevo pedido
  crearPedido(pedido: any): Observable<any> {
    return this.http.post<{success: boolean, data: any}>(`${this.apiUrl}/orders`, pedido)
      .pipe(
        map(response => response.data)
      );
  }

  // Obtener mis pedidos
  getMisPedidos(filtros?: any): Observable<Pedido[]> {
    let params = new HttpParams();

    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== null && filtros[key] !== undefined) {
          params = params.append(key, filtros[key].toString());
        }
      });
    }

    return this.http.get<{success: boolean, data: Pedido[]}>(`${this.apiUrl}/orders/my-orders`, { params })
      .pipe(
        map(response => response.data || [])
      );
  }

  // Obtener detalle de un pedido
  getDetallePedido(id: number): Observable<{pedido: Pedido, detalles: DetallePedido[]}> {
    return this.http.get<{success: boolean, data: {pedido: Pedido, detalles: DetallePedido[]}}>(`${this.apiUrl}/orders/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

  // Obtener seguimiento de un pedido
  seguimientoPedido(id: number): Observable<Seguimiento[]> {
    return this.http.get<{success: boolean, data: Seguimiento[]}>(`${this.apiUrl}/orders/${id}/tracking`)
      .pipe(
        map(response => response.data || [])
      );
  }

  // Obtener productos destacados
  getProductosDestacados(): Observable<Producto[]> {
    return this.http.get<{success: boolean, data: Producto[]}>(`${this.apiUrl}/products/featured`)
      .pipe(
        map(response => response.data || [])
      );
  }

  // Obtener categorías
  getCategorias(): Observable<string[]> {
    return this.http.get<{success: boolean, data: string[]}>(`${this.apiUrl}/products/categories`)
      .pipe(
        map(response => response.data || [])
      );
  }

  // Obtener marcas
  getMarcas(): Observable<string[]> {
    return this.http.get<{success: boolean, data: string[]}>(`${this.apiUrl}/products/brands`)
      .pipe(
        map(response => response.data || [])
      );
  }
}
