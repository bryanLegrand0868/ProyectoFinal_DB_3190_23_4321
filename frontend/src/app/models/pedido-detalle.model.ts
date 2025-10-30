export interface PedidoDetalle {
  id_detalle_pedido: number;
  id_producto: number;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}