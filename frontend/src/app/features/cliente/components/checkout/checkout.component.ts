import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService, CartItem } from '../../../../shared/services/cart.service';
import { OrderService } from '../../../../shared/services/order.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  standalone: false,
  providers: [MessageService]
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  cartItems: CartItem[] = [];
  currentStep: number = 1;
  loading: boolean = false;

  // Totales
  subtotal: number = 0;
  iva: number = 0;
  shippingCost: number = 0;
  total: number = 0;

  // Opciones de pago
  paymentMethods = [
    { label: 'Tarjeta de Crédito', value: 'TARJETA_CREDITO', icon: 'pi-credit-card' },
    { label: 'Tarjeta de Débito', value: 'TARJETA_DEBITO', icon: 'pi-wallet' },
    { label: 'PayPal', value: 'PAYPAL', icon: 'pi-paypal' },
    { label: 'Transferencia Bancaria', value: 'TRANSFERENCIA', icon: 'pi-building' }
  ];

  // Países disponibles
  countries = [
    { label: 'Guatemala', value: 'Guatemala' },
    { label: 'El Salvador', value: 'El Salvador' },
    { label: 'Honduras', value: 'Honduras' },
    { label: 'Nicaragua', value: 'Nicaragua' },
    { label: 'Costa Rica', value: 'Costa Rica' },
    { label: 'Panamá', value: 'Panamá' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cartService: CartService,
    private orderService: OrderService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCart();
  }

  /**
   * Inicializar formulario
   */
  initForm(): void {
    this.checkoutForm = this.fb.group({
      // Datos de envío
      direccion_envio: ['', [Validators.required, Validators.minLength(10)]],
      ciudad_envio: ['', Validators.required],
      pais_envio: ['Guatemala', Validators.required],
      codigo_postal: [''],
      telefono_contacto: ['', [Validators.required, Validators.pattern(/^[0-9\-\+\s]{8,}$/)]],

      // Método de pago
      tipo_pago: ['TARJETA_CREDITO', Validators.required],

      // Datos de pago (opcional, solo para validación visual)
      card_number: [''],
      card_name: [''],
      card_expiry: [''],
      card_cvv: ['']
    });
  }

  /**
   * Cargar carrito
   */
  loadCart(): void {
    this.cartItems = this.cartService.getCartItems();

    if (this.cartItems.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Carrito vacío',
        detail: 'No hay productos en el carrito'
      });
      this.router.navigate(['/cliente/productos']);
      return;
    }

    this.updateTotals();
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
   * Siguiente paso
   */
  nextStep(): void {
    if (this.currentStep === 1) {
      // Validar datos de envío
      const shippingFields = ['direccion_envio', 'ciudad_envio', 'pais_envio', 'telefono_contacto'];
      const isValid = shippingFields.every(field =>
        this.checkoutForm.get(field)?.valid
      );

      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Datos incompletos',
          detail: 'Por favor completa todos los campos de envío'
        });
        return;
      }
    }

    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  /**
   * Paso anterior
   */
  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  /**
   * Confirmar pedido
   */
  confirmOrder(): void {
    if (this.checkoutForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Formulario inválido',
        detail: 'Por favor completa todos los campos requeridos'
      });
      return;
    }

    this.loading = true;

    // Preparar datos del pedido
    const orderData = {
      direccion_envio: this.checkoutForm.value.direccion_envio,
      ciudad_envio: this.checkoutForm.value.ciudad_envio,
      pais_envio: this.checkoutForm.value.pais_envio,
      codigo_postal: this.checkoutForm.value.codigo_postal || '',
      telefono_contacto: this.checkoutForm.value.telefono_contacto,
      tipo_pago: this.checkoutForm.value.tipo_pago,
      detalles: this.cartItems.map(item => ({
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: item.precio_venta
      }))
    };

    // Crear pedido
    this.orderService.createOrder(orderData).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Pedido confirmado',
            detail: 'Tu pedido ha sido registrado exitosamente',
            life: 5000
          });

          // Limpiar carrito
          this.cartService.clearCart();

          // Navegar a mis pedidos
          setTimeout(() => {
            this.router.navigate(['/cliente/mis-pedidos']);
          }, 2000);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'No se pudo procesar el pedido'
          });
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al crear pedido:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo procesar el pedido. Intenta nuevamente.'
        });
      }
    });
  }

  /**
   * Volver al carrito
   */
  goBack(): void {
    this.router.navigate(['/cliente/carrito']);
  }
}
