import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartItem, CartService } from '../../../../../shared/services/cart.service';
import { OrderService } from '../../../../../shared/services/order.service';

@Component({
    selector: 'app-checkout',
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.css'],
    standalone: false
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

    paymentMethods = [
        {
            label: 'Tarjeta de Crédito',
            value: 'TARJETA_CREDITO',
            icon: 'pi pi-credit-card'
        },
        {
            label: 'Tarjeta de Débito',
            value: 'TARJETA_DEBITO',
            icon: 'pi pi-credit-card'
        },
        {
            label: 'PayPal',
            value: 'PAYPAL',
            icon: 'pi pi-paypal'
        },
        {
            label: 'Transferencia Bancaria',
            value: 'TRANSFERENCIA',
            icon: 'pi pi-money-bill'
        }
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
        private orderService: OrderService
    ) { }

    ngOnInit(): void {
        console.log('🛒 Checkout component loaded');
        this.initForm();
        this.loadCart();
    }

    /**
     * Inicializar formulario
     */
    initForm(): void {
        this.checkoutForm = this.fb.group({
            // Datos de envío - EXACTO al formato del backend
            direccion_envio: ['', [Validators.required, Validators.minLength(10)]],
            ciudad_envio: ['', Validators.required],
            pais_envio: ['Guatemala', Validators.required],
            telefono_contacto: ['', [Validators.required, Validators.pattern(/^[0-9\-\+\s]{8,}$/)]],

            // Método de pago - EXACTO al formato del backend
            tipo_pago: ['TARJETA_CREDITO', Validators.required],

            // Campos adicionales para el formulario (no se envían al backend)
            codigo_postal: [''] // Solo para UI, no se incluye en el POST
        });
    }

    /**
     * Cargar carrito
     */
    loadCart(): void {
        this.cartItems = this.cartService.getCartItems();

        if (this.cartItems.length === 0) {
            alert('Carrito vacío - No hay productos en el carrito');
            this.router.navigate(['/tienda/catalogo']);
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
            // Validar datos de envío - SOLO los campos que van al backend
            const shippingFields = ['direccion_envio', 'ciudad_envio', 'pais_envio', 'telefono_contacto'];
            const isValid = shippingFields.every(field =>
                this.checkoutForm.get(field)?.valid
            );

            if (!isValid) {
                alert('Datos incompletos - Por favor completa todos los campos de envío');
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
            alert('Formulario inválido - Por favor completa todos los campos requeridos');
            return;
        }

        this.loading = true;

        // ✅ FORMATO EXACTO del backend - SIN codigo_postal
        const orderData = {
            direccion_envio: this.checkoutForm.value.direccion_envio,
            ciudad_envio: this.checkoutForm.value.ciudad_envio,
            pais_envio: this.checkoutForm.value.pais_envio,
            telefono_contacto: this.checkoutForm.value.telefono_contacto,
            tipo_pago: this.checkoutForm.value.tipo_pago,
            detalles: this.cartItems.map(item => ({
                id_producto: item.id_producto,
                cantidad: item.cantidad,
                precio_unitario: item.precio_venta
            }))
        };
        console.log('📦 Sending order data (exact backend format):', orderData);
        console.log('🔗 API URL:', 'POST http://localhost:3000/api/orders');

        // Crear pedido
        this.orderService.createOrder(orderData).subscribe({
            next: (response: any) => {
                this.loading = false;
                console.log('✅ Order response:', response);
                
                if (response && (response.success || response.id_pedido || response.message)) {
                    alert('Pedido confirmado - Tu pedido ha sido registrado exitosamente');

                    // Limpiar carrito
                    this.cartService.clearCart();

                    // Navegar a mis pedidos
                    setTimeout(() => {
                        this.router.navigate(['/tienda/mis-pedidos']);
                    }, 1000);
                } else {
                    alert('Error - ' + (response?.message || 'No se pudo procesar el pedido'));
                }
            },
            error: (error) => {
                this.loading = false;
                console.error('❌ Error al crear pedido:', error);
                console.log('📊 Error details:', {
                    status: error.status,
                    statusText: error.statusText,
                    url: error.url,
                    message: error.message
                });
                
                alert('Error - No se pudo procesar el pedido. Detalles: ' + (error.message || 'Error desconocido'));
            }
        });
    }

    /**
     * Obtener etiqueta del método de pago
     */
    getPaymentMethodLabel(methodValue: string): string {
        const method = this.paymentMethods.find(m => m.value === methodValue);
        return method ? method.label : '';
    }

    /**
     * Volver al carrito
     */
    goBack(): void {
        this.router.navigate(['/tienda/carrito']);
    }
}