export interface Pedido {
  id_pedido: number;
  fecha_pedido: Date;
  direccion_envio: string;
  total: number;
  estado_pedido: string;
  estado_pago: string;
  tipo_pago: string;
  fecha_entrega_estimada?: Date;
}