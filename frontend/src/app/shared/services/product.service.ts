import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Producto {
  id_producto?: number;
  nombre: string;
  descripcion?: string;
  precio_venta: number;
  stock: number;
  categoria?: string;
  sku?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los productos
   */
  getProducts(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene un producto por su ID
   * @param id ID del producto
   */
  getProductById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crea un nuevo producto
   * @param product Datos del producto a crear
   */
  createProduct(product: Partial<Producto>): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, product).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza un producto existente
   * @param id ID del producto a actualizar
   * @param product Datos actualizados del producto
   */
  updateProduct(id: number, product: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, product).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Elimina un producto
   * @param id ID del producto a eliminar
   */
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Maneja los errores de las peticiones HTTP
   * @param error Error de la petición
   * @returns Observable con el error
   */
  private handleError(error: any) {
    console.error('Error en el servicio de productos:', error);
    return throwError(() => new Error(error.message || 'Error en el servidor'));
  }
}
