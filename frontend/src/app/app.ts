import { ChangeDetectorRef, Component, OnDestroy, OnInit, NgZone } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from './shared/services/auth.service';
import { MenuItem } from 'primeng/api';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  loading = false;
  currentUser: any = null;
  menuItems: MenuItem[] = [];
  showMenu: boolean = false;
  private subscription = new Subscription();

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    // Subscribe to user changes
    this.subscription.add(
      this.authService.currentUser.subscribe(user => {
        this.ngZone.run(() => {
          this.currentUser = user;
          this.updateMenuItems();
          this.updateMenuVisibility();
        });
      })
    );

    // Subscribe to route changes
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.updateMenuVisibility();
        this.updateMenuItems();
      })
    );
  }

  ngOnInit() {
    // Initial menu update
    this.updateMenuItems();
    this.updateMenuVisibility();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * Actualizar visibilidad del menú basado en la ruta actual
   */
  updateMenuVisibility(): void {
    const currentUrl = this.router.url;
    
    // Ocultar menú en login y rutas no autenticadas
    this.showMenu = !currentUrl.includes('/login') && !!this.currentUser;
  }

  /**
   * Actualizar elementos del menú según el rol del usuario
   */
  updateMenuItems(): void {
    if (!this.currentUser) {
      this.menuItems = [];
      return;
    }

    const userRole = this.currentUser.nombre_rol?.toLowerCase();

    if (userRole === 'cliente') {
      // Menú para clientes (se maneja en cliente-layout)
      this.menuItems = [];
    } else {
      // Menú para administradores/empleados
      this.menuItems = [
        { 
          label: 'Dashboard', 
          icon: 'pi pi-home', 
          routerLink: ['/dashboard'],
          command: () => this.navigateTo('/dashboard')
        },
        { 
          label: 'Ventas', 
          icon: 'pi pi-shopping-cart', 
          routerLink: ['/ventas'],
          command: () => this.navigateTo('/ventas')
        },
        { 
          label: 'Inventario', 
          icon: 'pi pi-box', 
          routerLink: ['/inventario'],
          command: () => this.navigateTo('/inventario')
        },
        { 
          label: 'Clientes', 
          icon: 'pi pi-users', 
          routerLink: ['/clientes'],
          command: () => this.navigateTo('/clientes')
        },
        { 
          label: 'Pedidos', 
          icon: 'pi pi-shopping-bag', 
          routerLink: ['/pedidos'],
          command: () => this.navigateTo('/pedidos')
        },
        { 
          label: 'Reportes', 
          icon: 'pi pi-chart-bar', 
          routerLink: ['/reportes'],
          command: () => this.navigateTo('/reportes')
        }
      ];

      // Agregar opción de admin solo para administradores
      if (userRole === 'administrador') {
        this.menuItems.push({
          label: 'Administración',
          icon: 'pi pi-cog',
          routerLink: ['/admin'],
          command: () => this.navigateTo('/admin')
        });
      }
    }
  }

  /**
   * Navegar a una ruta específica
   */
  navigateTo(route: string): void {
    this.router.navigate([route]).catch(err => {
      console.error('Error navegando a:', route, err);
    });
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.authService.logout();
    // El AuthService ya maneja la redirección al login
  }

  /**
   * Obtener el nombre del usuario para mostrar
   */
  getUserDisplayName(): string {
    return this.currentUser?.usuario || 'Usuario';
  }

  /**
   * Obtener el rol del usuario para mostrar
   */
  getUserRole(): string {
    return this.currentUser?.nombre_rol || '';
  }

  /**
   * Verificar si el usuario es cliente
   */
  isClientUser(): boolean {
    return this.currentUser?.nombre_rol?.toLowerCase() === 'cliente';
  }

  /**
   * Verificar si debe mostrar el layout de cliente
   */
  shouldShowClientLayout(): boolean {
    const currentUrl = this.router.url;
    return this.isClientUser() && currentUrl.startsWith('/tienda');
  }

  /**
   * Verificar si debe mostrar el layout de admin
   */
  shouldShowAdminLayout(): boolean {
    const currentUrl = this.router.url;
    return !this.isClientUser() && 
           !currentUrl.includes('/login') && 
           !currentUrl.startsWith('/tienda') &&
           !!this.currentUser;
  }
}