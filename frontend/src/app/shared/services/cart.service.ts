import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  id_producto: number;
  nombre: string;
  precio_venta: number;
  cantidad: number;
  subtotal: number;
  imagen_url?: string;
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
  private isBrowser: boolean;

  // Observables públicos
  public cart$ = this.cartSubject.asObservable();
  public cartCount$ = this.cartCountSubject.asObservable();

  // Constantes para cálculos
  private readonly IVA_RATE = 0.13; // 13%
  private readonly SHIPPING_COST = 10.00; // Q10 fijo

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadCartFromStorage();
  }

  /**
   * Cargar carrito desde localStorage
   */
  private loadCartFromStorage(): void {
    if (!this.isBrowser) {
      return; // No hacer nada si no estamos en el browser
    }

    try {
      const stored = localStorage.getItem('cart');
      if (stored) {
        this.cartItems = JSON.parse(stored);
        this.updateObservables();
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      this.cartItems = [];
    }
  }

  /**
   * Guardar carrito en localStorage
   */
  private saveCartToStorage(): void {
    if (!this.isBrowser) {
      return; // No hacer nada si no estamos en el browser
    }

    try {
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  /**
   * Actualizar observables
   */
  private updateObservables(): void {
    this.cartSubject.next([...this.cartItems]);
    this.cartCountSubject.next(this.getTotalItems());
  }

  /**
   * Agregar producto al carrito
   */
  addToCart(product: any, quantity: number = 1): void {
    const existingItem = this.cartItems.find(item => item.id_producto === product.id_producto);

    if (existingItem) {
      // Si el producto ya existe, incrementar cantidad
      existingItem.cantidad += quantity;
      existingItem.subtotal = existingItem.cantidad * existingItem.precio_venta;
    } else {
      // Si es nuevo, agregar al carrito
      const cartItem: CartItem = {
        id_producto: product.id_producto,
        nombre: product.nombre,
        precio_venta: product.precio_venta,
        cantidad: quantity,
        subtotal: product.precio_venta * quantity,
        imagen_url: product.imagen_url,
        categoria: product.nombre_categoria,
        marca: product.nombre_marca
      };
      this.cartItems.push(cartItem);
    }

    this.saveCartToStorage();
    this.updateObservables();
  }

  /**
   * Eliminar producto del carrito
   */
  removeFromCart(productId: number): void {
    this.cartItems = this.cartItems.filter(item => item.id_producto !== productId);
    this.saveCartToStorage();
    this.updateObservables();
  }

  /**
   * Actualizar cantidad de un producto
   */
  updateQuantity(productId: number, newQuantity: number): void {
    const item = this.cartItems.find(item => item.id_producto === productId);
    if (item) {
      if (newQuantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.cantidad = newQuantity;
        item.subtotal = item.cantidad * item.precio_venta;
        this.saveCartToStorage();
        this.updateObservables();
      }
    }
  }

  /**
   * Limpiar carrito
   */
  clearCart(): void {
    this.cartItems = [];
    this.saveCartToStorage();
    this.updateObservables();
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
   * Calcular subtotal
   */
  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + item.subtotal, 0);
  }

  /**
   * Calcular IVA
   */
  getIVA(): number {
    return this.getSubtotal() * this.IVA_RATE;
  }

  /**
   * Obtener costo de envío
   */
  getShippingCost(): number {
    return this.SHIPPING_COST;
  }

  /**
   * Calcular total
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

  /**
   * Obtener cantidad de un producto específico
   */
  getProductQuantity(productId: number): number {
    const item = this.cartItems.find(item => item.id_producto === productId);
    return item ? item.cantidad : 0;
  }

  /**
   * Verificar si un producto está en el carrito
   */
  isInCart(productId: number): boolean {
    return this.cartItems.some(item => item.id_producto === productId);
  }
}