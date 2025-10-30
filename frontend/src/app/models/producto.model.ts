export interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio_venta: number;
  precio_compra: number;
  id_categoria: number;
  nombre_categoria: string;
  id_marca: number;
  nombre_marca: string;
  codigo_barras: string;
  imagen_url: string;
  estado: string;
}