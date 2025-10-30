import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';
import { CartService } from '../../../../shared/services/cart.service';

@Component({
  selector: 'app-cliente-layout',
  templateUrl: './cliente-layout.component.html',
  styleUrls: ['./cliente-layout.component.css'],
  standalone: false
})
export class ClienteLayoutComponent implements OnInit {
  searchQuery: string = '';
  cartCount: number = 0;
  currentUser: any;
  showUserMenu: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Suscribirse al usuario actual
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });

    // Suscribirse al contador del carrito
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });
  }

  /**
   * Realizar búsqueda de productos
   */
  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/cliente/productos'], {
        queryParams: { search: this.searchQuery }
      });
    }
  }

  /**
   * Navegar al carrito
   */
  goToCart(): void {
    this.router.navigate(['/cliente/carrito']);
  }

  /**
   * Navegar a mis pedidos
   */
  goToOrders(): void {
    this.router.navigate(['/cliente/mis-pedidos']);
  }

  /**
   * Navegar al perfil
   */
  goToProfile(): void {
    this.router.navigate(['/cliente/perfil']);
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Toggle menú de usuario
   */
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  /**
   * Navegar al home
   */
  goToHome(): void {
    this.router.navigate(['/cliente/home']);
  }

  /**
   * Navegar a productos
   */
  goToProducts(): void {
    this.router.navigate(['/cliente/productos']);
  }
}
