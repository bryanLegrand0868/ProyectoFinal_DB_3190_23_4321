import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './shared/services/auth.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  loading = false;
  isCollapsed = true;
  currentUser: any;
  menuItems: MenuItem[]|undefined;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.authService.currentUser.subscribe(x => this.currentUser = x);
  }

  ngOnInit() {
    this.menuItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: ['/dashboard']
      },
      {
        label: 'Ventas',
        icon: 'pi pi-shopping-cart',
        routerLink: ['/ventas']
      },
      {
        label: 'Inventario',
        icon: 'pi pi-box',
        routerLink: ['/inventario']
      },
      {
        label: 'Clientes',
        icon: 'pi pi-users',
        routerLink: ['/clientes']
      },
      {
        label: 'Reportes',
        icon: 'pi pi-chart-bar',
        routerLink: ['/reportes']
      }
    ];
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}