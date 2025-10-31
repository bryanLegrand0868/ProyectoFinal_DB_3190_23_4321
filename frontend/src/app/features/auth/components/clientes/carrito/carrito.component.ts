import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartItem, CartService } from '../../../../../shared/services/cart.service';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css'],
  standalone: false
})
export class CarritoComponent implements OnInit {
  cartItems: CartItem[] = [];
  subtotal: number = 0;
  iva: number = 0;
  shippingCost: number = 0;
  total: number = 0;

  constructor(
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadCart();
    this.subscribeToCart();
  }

  /**
   * Cargar carrito
   */
  loadCart(): void {
    this.cartItems = this.cartService.getCartItems();
    this.updateTotals();
  }

  /**
   * Suscribirse a cambios en el carrito
   */
  subscribeToCart(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.updateTotals();
    });
  }

  /**
   * Actualizar totales
   */
  updateTotals(): void {
    this.subtotal = this.cartService.getSubtotal();
    this.iva = this.cartService.getIVA();
    this.shippingCost = this.cartService.getShippingCost();
    this.total = this.cartService.getTotal();
  }

  /**
   * Actualizar cantidad de un producto
   */
  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1) {
      this.confirmRemove(item);
      return;
    }

    this.cartService.updateQuantity(item.id_producto, newQuantity);
    console.log('Cantidad actualizada');
  }

  /**
   * Incrementar cantidad
   */
  incrementQuantity(item: CartItem): void {
    this.updateQuantity(item, item.cantidad + 1);
  }

  /**
   * Decrementar cantidad
   */
  decrementQuantity(item: CartItem): void {
    this.updateQuantity(item, item.cantidad - 1);
  }

  /**
   * Confirmar eliminación de producto
   */
  confirmRemove(item: CartItem): void {
    const confirmed = window.confirm(`¿Deseas eliminar ${item.nombre} del carrito?`);
    if (confirmed) {
      this.removeItem(item);
    }
  }

  /**
   * Eliminar producto del carrito
   */
  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.id_producto);
    console.log(`${item.nombre} se eliminó del carrito`);
  }

  /**
   * Limpiar carrito
   */
  confirmClearCart(): void {
    const confirmed = window.confirm('¿Estás seguro de que deseas vaciar el carrito?');
    if (confirmed) {
      this.clearCart();
    }
  }

  /**
   * Vaciar carrito
   */
  clearCart(): void {
    this.cartService.clearCart();
    console.log('Carrito vaciado - Se eliminaron todos los productos del carrito');
  }

  /**
   * Continuar comprando
   */
  continueShopping(): void {
    this.router.navigate(['/tienda/productos']);
  }

  /**
   * Proceder al checkout
   */
  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      alert('Carrito vacío - Agrega productos al carrito para continuar');
      return;
    }
    this.router.navigate(['/tienda/checkout']);
  }

  /**
   * Verificar si el carrito está vacío
   */
  isCartEmpty(): boolean {
    return this.cartService.isEmpty();
  }
}