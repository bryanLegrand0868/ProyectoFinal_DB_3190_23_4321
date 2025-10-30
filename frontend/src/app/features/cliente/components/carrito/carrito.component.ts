import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../../../shared/services/cart.service';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css'],
  standalone: false,
  providers: [MessageService, ConfirmationService]
})
export class CarritoComponent implements OnInit {
  cartItems: CartItem[] = [];
  subtotal: number = 0;
  iva: number = 0;
  shippingCost: number = 0;
  total: number = 0;

  constructor(
    private router: Router,
    private cartService: CartService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
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
    this.messageService.add({
      severity: 'info',
      summary: 'Cantidad actualizada',
      detail: 'La cantidad del producto se actualizó',
      life: 2000
    });
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
    this.confirmationService.confirm({
      message: `¿Deseas eliminar ${item.nombre} del carrito?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.removeItem(item);
      }
    });
  }

  /**
   * Eliminar producto del carrito
   */
  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.id_producto);
    this.messageService.add({
      severity: 'success',
      summary: 'Producto eliminado',
      detail: `${item.nombre} se eliminó del carrito`,
      life: 3000
    });
  }

  /**
   * Limpiar carrito
   */
  confirmClearCart(): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas vaciar el carrito?',
      header: 'Confirmar acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, vaciar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.clearCart();
      }
    });
  }

  /**
   * Vaciar carrito
   */
  clearCart(): void {
    this.cartService.clearCart();
    this.messageService.add({
      severity: 'info',
      summary: 'Carrito vaciado',
      detail: 'Se eliminaron todos los productos del carrito',
      life: 3000
    });
  }

  /**
   * Continuar comprando
   */
  continueShopping(): void {
    this.router.navigate(['/cliente/productos']);
  }

  /**
   * Proceder al checkout
   */
  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Carrito vacío',
        detail: 'Agrega productos al carrito para continuar',
        life: 3000
      });
      return;
    }
    this.router.navigate(['/cliente/checkout']);
  }

  /**
   * Verificar si el carrito está vacío
   */
  isCartEmpty(): boolean {
    return this.cartService.isEmpty();
  }
}
