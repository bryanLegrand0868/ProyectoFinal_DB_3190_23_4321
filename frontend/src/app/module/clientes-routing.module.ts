import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClienteLayoutComponent } from '../features/auth/components/clientes/cliente-layout.component/cliente-layout.component';
import { HomeClienteComponent } from '../features/auth/components/clientes/home/home-cliente.component';
import { CatalogoProductosComponent } from '../features/auth/components/clientes/catalogo/catalogo-productos.component';
import { CarritoComponent } from '../features/auth/components/clientes/carrito/carrito.component';
import { CheckoutComponent } from '../features/auth/components/clientes/checkout/checkout.component';
import { MisPedidosComponent } from '../features/auth/components/clientes/mis-pedidos/mis-pedidos.component';
import { DetallePedidoComponent } from '../features/auth/components/clientes/detalle-pedido/detalle-pedido.component';

const routes: Routes = [
  {
    path: '',
    component: ClienteLayoutComponent,
    children: [
      { 
        path: '', 
        redirectTo: 'inicio', 
        pathMatch: 'full' 
      },
      { 
        path: 'inicio', 
        component: HomeClienteComponent,
        data: { title: 'Inicio' }
      },
      { 
        path: 'catalogo', 
        component: CatalogoProductosComponent,
        data: { title: 'Catálogo de Productos' }
      },
      { 
        path: 'carrito', 
        component: CarritoComponent,
        data: { title: 'Carrito de Compras' }
      },
      { 
        path: 'checkout', 
        component: CheckoutComponent,
        data: { title: 'Finalizar Compra' }
      },
      { 
        path: 'mis-pedidos', 
        component: MisPedidosComponent,
        data: { title: 'Mis Pedidos' }
      },
      { 
        path: 'pedido/:id', 
        component: DetallePedidoComponent,
        data: { title: 'Detalle del Pedido' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientesRoutingModule { }