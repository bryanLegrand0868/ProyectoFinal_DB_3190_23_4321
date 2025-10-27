import { Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';
import { LoginComponent } from './features/auth/components/login/login.component';
import { DashboardComponent } from './features/auth/components/dashboard/dashboard.component';
import { VentasComponent } from './features/auth/components/ventas/ventas.component';
import { ProductosComponent } from './features/auth/components/productos/productos.component';
import { InventarioComponent } from './features/auth/components/inventario/inventario.component';
import { ClientesComponent } from './features/auth/components/clientes/clientes.component';
import { PedidosComponent } from './features/auth/components/pedidos/pedidos.component';
import { ReportesComponent } from './features/auth/components/reportes/reportes.component';
import { AdminComponent } from './features/auth/components/admin/admin.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador', 'Cliente'] }, // AuthGuard can use esto para validar acceso por rol
  },

  // Rutas principales del sistema (carga perezosa de componentes; crear componentes según convenga)
  {
    path: 'ventas',
    component: VentasComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador', 'Vendedor', 'Gerente Sucursal'] },
  },

  {
    path: 'productos',
    component: ProductosComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador', 'Gerente General', 'Gerente Sucursal', 'Bodeguero'] },
  },

  {
    path: 'inventario',
    component: InventarioComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador', 'Bodeguero', 'Gerente Sucursal'] },
  },

  {
    path: 'clientes',
    component: ClientesComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        'Administrador',
        'Gerente General',
        'Gerente Sucursal',
        'Vendedor',
        'Cliente',
      ],
    },
  },

  {
    path: 'pedidos',
    component: PedidosComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador', 'Cliente', 'Gerente Sucursal'] },
  },

  // Reportes gerenciales mínimos (al menos 3): ventas, top clientes, inventario bajo
  {
    path: 'reportes',
    component: ReportesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador', 'Gerente General', 'Contador'] },
  },

  // Área de administración (solo Admin)
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] },
  },

  { path: '**', redirectTo: 'dashboard' },
];