import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  id_producto: number;
  nombre: string;
  precio_venta: number;
  cantidad: number;
  imagen_url?: string;
  subtotal: number;
  categoria?: string;
  marca?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private cartCountSubject = new BehaviorSubject<number>(0);

  // Observable para que los componentes se suscriban
  cart$ = this.cartSubject.asObservable();
  cartCount$ = this.cartCountSubject.asObservable();

  constructor() {
    this.loadCartFromStorage();
  }

  /**
   * Cargar carrito desde localStorage
   */
  private loadCartFromStorage(): void {
    const savedCart = localStorage.getItem('shopping_cart');
    if (savedCart) {
      try {
        this.cartItems = JSON.parse(savedCart);
        this.updateCart();
      } catch (error) {
        console.error('Error al cargar el carrito:', error);
        this.cartItems = [];
      }
    }
  }

  /**
   * Guardar carrito en localStorage
   */
  private saveCartToStorage(): void {
    localStorage.setItem('shopping_cart', JSON.stringify(this.cartItems));
  }

  /**
   * Actualizar observables
   */
  private updateCart(): void {
    this.cartSubject.next([...this.cartItems]);
    this.cartCountSubject.next(this.getTotalItems());
  }

  /**
   * Agregar producto al carrito
   */
  addToCart(product: any, cantidad: number = 1): void {
    const existingItem = this.cartItems.find(
      item => item.id_producto === product.id_producto
    );

    if (existingItem) {
      existingItem.cantidad += cantidad;
      existingItem.subtotal = existingItem.cantidad * existingItem.precio_venta;
    } else {
      const newItem: CartItem = {
        id_producto: product.id_producto,
        nombre: product.nombre,
        precio_venta: product.precio_venta,
        cantidad: cantidad,
        imagen_url: product.imagen_url,
        subtotal: product.precio_venta * cantidad,
        categoria: product.categoria,
        marca: product.marca
      };
      this.cartItems.push(newItem);
    }

    this.saveCartToStorage();
    this.updateCart();
  }

  /**
   * Actualizar cantidad de un producto
   */
  updateQuantity(id_producto: number, cantidad: number): void {
    const item = this.cartItems.find(i => i.id_producto === id_producto);

    if (item) {
      if (cantidad <= 0) {
        this.removeFromCart(id_producto);
      } else {
        item.cantidad = cantidad;
        item.subtotal = item.cantidad * item.precio_venta;
        this.saveCartToStorage();
        this.updateCart();
      }
    }
  }

  /**
   * Eliminar producto del carrito
   */
  removeFromCart(id_producto: number): void {
    this.cartItems = this.cartItems.filter(
      item => item.id_producto !== id_producto
    );
    this.saveCartToStorage();
    this.updateCart();
  }

  /**
   * Limpiar carrito
   */
  clearCart(): void {
    this.cartItems = [];
    localStorage.removeItem('shopping_cart');
    this.updateCart();
  }

  /**
   * Obtener items del carrito
   */
  getCartItems(): CartItem[] {
    return [...this.cartItems];
  }

  /**
   * Obtener total de items
   */
  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.cantidad, 0);
  }

  /**
   * Obtener subtotal
   */
  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + item.subtotal, 0);
  }

  /**
   * Calcular IVA (13%)
   */
  getIVA(): number {
    return this.getSubtotal() * 0.13;
  }

  /**
   * Calcular costo de envío (ejemplo: $10 fijo)
   */
  getShippingCost(): number {
    return this.cartItems.length > 0 ? 10 : 0;
  }

  /**
   * Obtener total final
   */
  getTotal(): number {
    return this.getSubtotal() + this.getIVA() + this.getShippingCost();
  }

  /**
   * Verificar si el carrito está vacío
   */
  isEmpty(): boolean {
    return this.cartItems.length === 0;
  }
}
