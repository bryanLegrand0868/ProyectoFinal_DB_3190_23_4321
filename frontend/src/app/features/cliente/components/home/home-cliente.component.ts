import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../../shared/services/product.service';
import { CartService } from '../../../../shared/services/cart.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-home-cliente',
  templateUrl: './home-cliente.component.html',
  styleUrls: ['./home-cliente.component.css'],
  standalone: false,
  providers: [MessageService]
})
export class HomeClienteComponent implements OnInit {
  featuredProducts: any[] = [];
  categories: any[] = [
    {
      id: 1,
      nombre: 'Calzado Deportivo',
      descripcion: 'Encuentra los mejores tenis y zapatillas',
      icon: 'pi pi-shopping-bag',
      color: '#667eea'
    },
    {
      id: 2,
      nombre: 'Ropa Deportiva Hombre',
      descripcion: 'Playeras, pants y más',
      icon: 'pi pi-user',
      color: '#764ba2'
    },
    {
      id: 3,
      nombre: 'Ropa Deportiva Mujer',
      descripcion: 'Licras, tops y más',
      icon: 'pi pi-heart',
      color: '#f093fb'
    },
    {
      id: 4,
      nombre: 'Accesorios',
      descripcion: 'Gorras, calcetines, guantes',
      icon: 'pi pi-star',
      color: '#4facfe'
    },
    {
      id: 5,
      nombre: 'Equipamiento',
      descripcion: 'Balones, pesas, cuerdas',
      icon: 'pi pi-box',
      color: '#43e97b'
    }
  ];

  banners: any[] = [
    {
      title: 'Ofertas Especiales',
      subtitle: 'Hasta 50% de descuento en productos seleccionados',
      image: 'assets/banner1.jpg',
      cta: 'Ver ofertas'
    },
    {
      title: 'Nueva Colección',
      subtitle: 'Descubre las últimas tendencias en ropa deportiva',
      image: 'assets/banner2.jpg',
      cta: 'Explorar'
    },
    {
      title: 'Envío Gratis',
      subtitle: 'En compras mayores a Q200',
      image: 'assets/banner3.jpg',
      cta: 'Comprar ahora'
    }
  ];

  currentBannerIndex: number = 0;
  loading: boolean = false;

  constructor(
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.startBannerRotation();
  }

  /**
   * Cargar productos destacados
   */
  loadFeaturedProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (response: any) => {
        if (response && response.success) {
          // Tomar los primeros 8 productos como destacados
          this.featuredProducts = (response.data || []).slice(0, 8);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los productos destacados'
        });
      }
    });
  }

  /**
   * Iniciar rotación automática de banners
   */
  startBannerRotation(): void {
    setInterval(() => {
      this.nextBanner();
    }, 5000);
  }

  /**
   * Siguiente banner
   */
  nextBanner(): void {
    this.currentBannerIndex = (this.currentBannerIndex + 1) % this.banners.length;
  }

  /**
   * Banner anterior
   */
  prevBanner(): void {
    this.currentBannerIndex =
      (this.currentBannerIndex - 1 + this.banners.length) % this.banners.length;
  }

  /**
   * Ir a un banner específico
   */
  goToBanner(index: number): void {
    this.currentBannerIndex = index;
  }

  /**
   * Navegar a una categoría
   */
  viewCategory(categoryId: number): void {
    this.router.navigate(['/cliente/productos'], {
      queryParams: { categoria: categoryId }
    });
  }

  /**
   * Ver detalle de producto
   */
  viewProductDetail(productId: number): void {
    this.router.navigate(['/cliente/producto', productId]);
  }

  /**
   * Agregar producto al carrito
   */
  addToCart(product: any, event: Event): void {
    event.stopPropagation();
    this.cartService.addToCart(product, 1);
    this.messageService.add({
      severity: 'success',
      summary: 'Producto agregado',
      detail: `${product.nombre} se agregó al carrito`,
      life: 3000
    });
  }

  /**
   * Ver todos los productos
   */
  viewAllProducts(): void {
    this.router.navigate(['/cliente/productos']);
  }

  /**
   * Acción del banner
   */
  bannerAction(): void {
    this.router.navigate(['/cliente/productos']);
  }
}
