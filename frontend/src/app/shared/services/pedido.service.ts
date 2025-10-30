import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Pedido } from '../../models/pedido.model';
import { TrackingItem } from '../../models/tracking.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Crear un nuevo pedido
  crearPedido(pedidoData: any): Observable<Pedido> {
    return this.http.post<{success: boolean, data: Pedido}>(`${this.apiUrl}/orders`, pedidoData)
      .pipe(
        map(response => response.data)
      );
  }

  // Obtener pedidos del usuario actual
  obtenerMisPedidos(): Observable<Pedido[]> {
    return this.http.get<{success: boolean, data: Pedido[]}>(`${this.apiUrl}/orders/my-orders`)
      .pipe(
        map(response => response.data)
      );
  }

  // Obtener detalle de un pedido específico
  obtenerDetallePedido(idPedido: number): Observable<Pedido> {
    return this.http.get<{success: boolean, data: Pedido}>(`${this.apiUrl}/orders/${idPedido}`)
      .pipe(
        map(response => response.data)
      );
  }

  // Obtener tracking de un pedido
  obtenerTrackingPedido(idPedido: number): Observable<TrackingItem[]> {
    return this.http.get<{success: boolean, data: TrackingItem[]}>(`${this.apiUrl}/orders/${idPedido}/tracking`)
      .pipe(
        map(response => response.data)
      );
  }

  // Cancelar un pedido
  cancelarPedido(idPedido: number, motivo: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/orders/${idPedido}/cancel`, { motivo });
  }
}