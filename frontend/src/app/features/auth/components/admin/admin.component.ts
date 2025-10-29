import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'admin-root',
  templateUrl: './admin.component.html',
  standalone: false,
})
export class AdminComponent implements OnInit {
  title = 'Sportswear System';
  
  sidebarVisible = false;
  menuItems: MenuItem[] = [];
  currentUser: any = null;
  selectedCountry: any = null;
  
  countries = [
    { name: 'Guatemala', code: 'GT', flag: '🇬🇹' },
    { name: 'El Salvador', code: 'SV', flag: '🇸🇻' },
    { name: 'Honduras', code: 'HN', flag: '🇭🇳' },
    { name: 'Nicaragua', code: 'NI', flag: '🇳🇮' },
    { name: 'Costa Rica', code: 'CR', flag: '🇨🇷' },
    { name: 'Panamá', code: 'PA', flag: '🇵🇦' },
    { name: 'Belice', code: 'BZ', flag: '🇧🇿' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.buildMenu();
    });

    // Cargar país guardado
    const savedCountry = localStorage.getItem('selectedCountry');
    if (savedCountry) {
      this.selectedCountry = JSON.parse(savedCountry);
    } else {
      this.selectedCountry = this.countries[0]; // Guatemala por defecto
      this.saveCountry();
    }
  }

  buildMenu() {
    if (!this.currentUser) {
      this.menuItems = [];
      return;
    }

    const role = this.currentUser.user?.nombre_rol?.toUpperCase();

    // Menú base para todos los roles autenticados
    this.menuItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: ['/dashboard']
      }
    ];

    // Menús según el rol
    switch (role) {
      case 'ADMINISTRADOR':
        this.menuItems.push(
          {
            label: 'Gestión',
            icon: 'pi pi-cog',
            items: [
              { label: 'Usuarios', icon: 'pi pi-users', routerLink: ['/admin'] },
              { label: 'Empleados', icon: 'pi pi-id-card', routerLink: ['/admin'] },
              { label: 'Sucursales', icon: 'pi pi-building', routerLink: ['/admin'] }
            ]
          },
          {
            label: 'Operaciones',
            icon: 'pi pi-briefcase',
            items: [
              { label: 'Ventas', icon: 'pi pi-shopping-cart', routerLink: ['/ventas'] },
              { label: 'Productos', icon: 'pi pi-box', routerLink: ['/productos'] },
              { label: 'Inventario', icon: 'pi pi-warehouse', routerLink: ['/inventario'] },
              { label: 'Clientes', icon: 'pi pi-users', routerLink: ['/clientes'] },
              { label: 'Pedidos', icon: 'pi pi-shopping-bag', routerLink: ['/pedidos'] }
            ]
          },
          {
            label: 'Reportes',
            icon: 'pi pi-chart-bar',
            routerLink: ['/reportes']
          }
        );
        break;

      case 'GERENTE GENERAL':
        this.menuItems.push(
          {
            label: 'Operaciones',
            icon: 'pi pi-briefcase',
            items: [
              { label: 'Empleados', icon: 'pi pi-id-card', routerLink: ['/admin'] },
              { label: 'Ventas', icon: 'pi pi-shopping-cart', routerLink: ['/ventas'] },
              { label: 'Productos', icon: 'pi pi-box', routerLink: ['/productos'] },
              { label: 'Inventario', icon: 'pi pi-warehouse', routerLink: ['/inventario'] },
              { label: 'Clientes', icon: 'pi pi-users', routerLink: ['/clientes'] },
              { label: 'Pedidos', icon: 'pi pi-shopping-bag', routerLink: ['/pedidos'] }
            ]
          },
          {
            label: 'Reportes',
            icon: 'pi pi-chart-bar',
            routerLink: ['/reportes']
          }
        );
        break;

      case 'VENDEDOR':
        this.menuItems.push(
          {
            label: 'Ventas',
            icon: 'pi pi-shopping-cart',
            routerLink: ['/ventas']
          },
          {
            label: 'Productos',
            icon: 'pi pi-box',
            routerLink: ['/productos']
          },
          {
            label: 'Clientes',
            icon: 'pi pi-users',
            routerLink: ['/clientes']
          }
        );
        break;

      case 'BODEGUERO':
        this.menuItems.push(
          {
            label: 'Inventario',
            icon: 'pi pi-warehouse',
            routerLink: ['/inventario']
          },
          {
            label: 'Productos',
            icon: 'pi pi-box',
            routerLink: ['/productos']
          }
        );
        break;

      case 'CLIENTE':
        this.menuItems.push(
          {
            label: 'Catálogo',
            icon: 'pi pi-shopping-cart',
            routerLink: ['/productos']
          },
          {
            label: 'Mis Pedidos',
            icon: 'pi pi-shopping-bag',
            routerLink: ['/pedidos']
          }
        );
        break;
    }
  }

  onCountryChange() {
    this.saveCountry();
  }

  saveCountry() {
    localStorage.setItem('selectedCountry', JSON.stringify(this.selectedCountry));
  }

  getSelectedCountry(): string {
    return this.selectedCountry?.code || 'GT';
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  getUserName(): string {
    return this.currentUser?.user?.usuario || 'Usuario';
  }

  getUserRole(): string {
    return this.currentUser?.user?.nombre_rol || '';
  }
}