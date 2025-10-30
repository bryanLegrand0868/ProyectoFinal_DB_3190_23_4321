import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los productos
   */
  getProductos(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene un producto por su ID
   * @param id ID del producto
   */
  getProductoById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crea un nuevo producto
   * @param product Datos del producto a crear
   */
  createProducto(product: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, product).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza un producto existente
   * @param id ID del producto a actualizar
   * @param product Datos actualizados del producto
   */
  updateProducto(id: number, product: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, product).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Elimina un producto
   * @param id ID del producto a eliminar
   */
  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Buscar productos por término
   * @param searchTerm Término de búsqueda
   */
  searchProductos(searchTerm: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/search`, {
      params: { q: searchTerm }
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener productos por categoría
   * @param categoryId ID de la categoría
   */
  getProductosByCategoria(categoryId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/categoria/${categoryId}`).pipe(
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