export interface TrackingItem {
  id_seguimiento: number;
  fecha_hora: Date;
  estado: string;
  descripcion: string;
  ubicacion?: string;
}