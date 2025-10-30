import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';
import { RoleGuard } from './shared/guards/role.guard';
import { LoginComponent } from './features/auth/components/login/login.component';
import { DashboardComponent } from './features/auth/components/dashboard/dashboard.component';
import { VentasComponent } from './features/auth/components/ventas/ventas.component';
import { InventarioComponent } from './features/auth/components/inventario/inventario.component';
import { PedidosComponent } from './features/auth/components/pedidos/pedidos.component';
import { ReportesComponent } from './features/auth/components/reportes/reportes.component';
import { AdminComponent } from './features/auth/components/admin/admin.component';

export const routes: Routes = [
  // Ruta por defecto - redirige basado en autenticación
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },

  // Login - accesible sin autenticación
  {
    path: 'login',
    component: LoginComponent
  },

  // Dashboard principal - solo para empleados/administradores
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      roles: ['Administrador', 'Gerente General', 'Gerente Sucursal', 'Vendedor', 'Bodeguero', 'Contador'] 
    }
  },

  // Rutas del sistema administrativo
  {
    path: 'ventas',
    component: VentasComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      roles: ['Administrador', 'Vendedor', 'Gerente Sucursal', 'Gerente General'] 
    }
  },

  /*{
    path: 'productos',
    loadChildren: () => import('./modules/productos.module').then(m => m.ProductosModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      roles: ['Administrador', 'Gerente General', 'Gerente Sucursal', 'Bodeguero'] 
    }
  },*/

  {
    path: 'inventario',
    component: InventarioComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      roles: ['Administrador', 'Bodeguero', 'Gerente Sucursal', 'Gerente General'] 
    }
  },

  {
    path: 'pedidos',
    component: PedidosComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      roles: ['Administrador', 'Gerente Sucursal', 'Gerente General'] 
    }
  },

  {
    path: 'reportes',
    component: ReportesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      roles: ['Administrador', 'Gerente General', 'Contador'] 
    }
  },

  // Área de administración - solo administradores
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      roles: ['Administrador'] 
    }
  },

  // Módulo de clientes (e-commerce) - carga lazy
  {
    path: 'tienda',
    loadChildren: () => import('./module/clientes.module').then(m => m.ClientesModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      roles: ['Cliente'] 
    }
  },

  // Ruta comodín - redirige a login si no está autenticado, sino al dashboard apropiado
  { 
    path: '**', 
    redirectTo: '/login' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false, // Cambiar a true para debug de rutas
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }