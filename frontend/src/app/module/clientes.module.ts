import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClientesRoutingModule } from './clientes-routing.module';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';

// Components
import { ClienteLayoutComponent } from '../features/auth/components/clientes/cliente-layout.component/cliente-layout.component';
import { HomeClienteComponent } from '../features/auth/components/clientes/home/home-cliente.component';
import { CatalogoProductosComponent } from '../features/auth/components/clientes/catalogo/catalogo-productos.component';
import { CarritoComponent } from '../features/auth/components/clientes/carrito/carrito.component';
import { CheckoutComponent } from '../features/auth/components/clientes/checkout/checkout.component';
import { MisPedidosComponent } from '../features/auth/components/clientes/mis-pedidos/mis-pedidos.component';
import { DetallePedidoComponent } from '../features/auth/components/clientes/detalle-pedido/detalle-pedido.component';
import { PerfilClienteComponent } from '../features/auth/components/clientes/perfil-cliente/perfil-cliente.component';

@NgModule({
  declarations: [
    ClienteLayoutComponent,
    HomeClienteComponent,
    CatalogoProductosComponent,
    CarritoComponent,
    CheckoutComponent,
    MisPedidosComponent,
    DetallePedidoComponent,
    PerfilClienteComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClientesRoutingModule,
    
    // PrimeNG
    CardModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    ProgressSpinnerModule,
    DialogModule,
    TableModule
  ],
  providers: [
    MessageService
  ]
})
export class ClientesModule { }