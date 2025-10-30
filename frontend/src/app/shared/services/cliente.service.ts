import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Cliente {
  id_cliente?: number;
  nombres: string;
  apellidos: string;
  fecha_nacimiento?: Date;
  genero?: 'M' | 'F';
  dui?: string;
  nit?: string;
  direccion?: string;
  telefono?: string;
  email: string;
  fecha_registro?: Date;
  puntos_acumulados?: number;
  estado?: 'A' | 'I';
}

export interface ClienteCompleto extends Cliente {
  total_compras?: number;
  monto_total_gastado?: number;
  ultima_compra?: Date;
  pedidos_pendientes?: number;
}

export interface ClienteEstadisticas {
  total_pedidos: number;
  pedidos_completados: number;
  pedidos_pendientes: number;
  pedidos_cancelados: number;
  monto_total: number;
  monto_promedio: number;
  producto_mas_comprado?: string;
  sucursal_frecuente?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los clientes (usuarios con rol Cliente)
   */
  getClientes(): Observable<Cliente[]> {
    return this.http.get<any>(`${this.apiUrl}/users`).pipe(
      map(response => {
        if (response && response.success && Array.isArray(response.data)) {
          // Filtrar solo usuarios con rol Cliente
          return response.data
            .filter((user: any) => user.NOMBRE_ROL === 'Cliente')
            .map((user: any) => this.mapUserToCliente(user));
        }
        return [];
      }),
      catchError(error => {
        console.error('Error al obtener clientes:', error);
        throw error;
      })
    );
  }

  /**
   * Obtiene los datos de la tabla clientes directamente
   */
  getClientesData(): Observable<Cliente[]> {
    // Necesitarás crear este endpoint en el backend
    return this.http.get<any>(`${this.apiUrl}/clientes`).pipe(
      map(response => {
        if (response && response.success && Array.isArray(response.data)) {
          return response.data.map((cliente: any) => ({
            id_cliente: cliente.ID_CLIENTE,
            nombres: cliente.NOMBRES,
            apellidos: cliente.APELLIDOS,
            fecha_nacimiento: cliente.FECHA_NACIMIENTO ? new Date(cliente.FECHA_NACIMIENTO) : undefined,
            genero: cliente.GENERO,
            dui: cliente.DUI,
            nit: cliente.NIT,
            direccion: cliente.DIRECCION,
            telefono: cliente.TELEFONO,
            email: cliente.EMAIL,
            fecha_registro: cliente.FECHA_REGISTRO ? new Date(cliente.FECHA_REGISTRO) : undefined,
            puntos_acumulados: cliente.PUNTOS_ACUMULADOS,
            estado: cliente.ESTADO
          }));
        }
        return [];
      })
    );
  }

  /**
   * Obtiene un cliente por ID
   */
  getClienteById(id: number): Observable<ClienteCompleto> {
    return this.http.get<any>(`${this.apiUrl}/clientes/${id}`).pipe(
      map(response => {
        if (response && response.success) {
          return this.mapClienteCompleto(response.data);
        }
        throw new Error('Cliente no encontrado');
      })
    );
  }

  /**
   * Crea un nuevo cliente
   */
  createCliente(cliente: Partial<Cliente>): Observable<Cliente> {
    return this.http.post<any>(`${this.apiUrl}/clientes`, cliente).pipe(
      map(response => {
        if (response && response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Error al crear cliente');
      })
    );
  }

  /**
   * Actualiza un cliente existente
   */
  updateCliente(id: number, cliente: Partial<Cliente>): Observable<Cliente> {
    return this.http.put<any>(`${this.apiUrl}/clientes/${id}`, cliente).pipe(
      map(response => {
        if (response && response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Error al actualizar cliente');
      })
    );
  }

  /**
   * Desactiva un cliente (soft delete)
   */
  deleteCliente(id: number): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/clientes/${id}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Error al eliminar cliente');
        }
      })
    );
  }

  /**
   * Busca clientes por nombre o email
   */
  searchClientes(query: string): Observable<Cliente[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<any>(`${this.apiUrl}/clientes/search`, { params }).pipe(
      map(response => {
        if (response && response.success) {
          return response.data || [];
        }
        return [];
      })
    );
  }

  /**
   * Obtiene los pedidos de un cliente
   */
  getClientePedidos(idCliente: number): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/orders/my-orders`, {
      params: { id_cliente: idCliente.toString() }
    }).pipe(
      map(response => {
        if (response && response.success) {
          return response.data || [];
        }
        return [];
      })
    );
  }

  /**
   * Obtiene las estadísticas de un cliente
   */
  getClienteEstadisticas(idCliente: number): Observable<ClienteEstadisticas> {
    return this.http.get<any>(`${this.apiUrl}/clientes/${idCliente}/estadisticas`).pipe(
      map(response => {
        if (response && response.success) {
          return response.data;
        }
        return {
          total_pedidos: 0,
          pedidos_completados: 0,
          pedidos_pendientes: 0,
          pedidos_cancelados: 0,
          monto_total: 0,
          monto_promedio: 0
        };
      })
    );
  }

  /**
   * Obtiene el historial de compras de un cliente
   */
  getClienteCompras(idCliente: number): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/clientes/${idCliente}/compras`).pipe(
      map(response => {
        if (response && response.success) {
          return response.data || [];
        }
        return [];
      })
    );
  }

  /**
   * Mapea un usuario a cliente
   */
  private mapUserToCliente(user: any): Cliente {
    return {
      id_cliente: user.ID_USUARIO,
      nombres: user.USUARIO,
      apellidos: '',
      email: user.USUARIO + '@cliente.com', // Placeholder
      fecha_registro: user.FECHA_CREACION ? new Date(user.FECHA_CREACION) : undefined,
      estado: user.ESTADO,
      puntos_acumulados: 0
    };
  }

  /**
   * Mapea datos completos del cliente
   */
  private mapClienteCompleto(data: any): ClienteCompleto {
    return {
      id_cliente: data.ID_CLIENTE,
      nombres: data.NOMBRES,
      apellidos: data.APELLIDOS,
      fecha_nacimiento: data.FECHA_NACIMIENTO ? new Date(data.FECHA_NACIMIENTO) : undefined,
      genero: data.GENERO,
      dui: data.DUI,
      nit: data.NIT,
      direccion: data.DIRECCION,
      telefono: data.TELEFONO,
      email: data.EMAIL,
      fecha_registro: data.FECHA_REGISTRO ? new Date(data.FECHA_REGISTRO) : undefined,
      puntos_acumulados: data.PUNTOS_ACUMULADOS,
      estado: data.ESTADO,
      total_compras: data.TOTAL_COMPRAS,
      monto_total_gastado: data.MONTO_TOTAL_GASTADO,
      ultima_compra: data.ULTIMA_COMPRA ? new Date(data.ULTIMA_COMPRA) : undefined,
      pedidos_pendientes: data.PEDIDOS_PENDIENTES
    };
  }
}