import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ProductoService } from '../../../../../shared/services/product.service';
import { CartService } from '../../../../../shared/services/cart.service';

@Component({
  selector: 'app-catalogo-productos',
  templateUrl: './catalogo-productos.component.html',
  styleUrls: ['./catalogo-productos.component.css'],
  standalone: false,
  providers: [MessageService]
})
export class CatalogoProductosComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  categories: any[] = [];
  brands: any[] = [];

  // Filtros
  selectedCategory: number | null = null;
  selectedBrand: number | null = null;
  searchTerm: string = '';
  priceRange: number[] = [0, 1000];
  sortBy: string = 'nombre';

  // UI States
  loading: boolean = false;
  viewMode: 'grid' | 'list' = 'grid';

  // Opciones de ordenamiento
  sortOptions = [
    { label: 'Nombre (A-Z)', value: 'nombre' },
    { label: 'Precio: Menor a Mayor', value: 'precio_asc' },
    { label: 'Precio: Mayor a Menor', value: 'precio_desc' },
    { label: 'Más Recientes', value: 'recientes' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductoService,
    private cartService: CartService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadFiltersFromQueryParams();
  }

  /**
   * Cargar productos
   */
  loadProducts(): void {
    this.loading = true;
    this.productService.getProductos().subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.products = response.data || [];
          this.extractCategories();
          this.extractBrands();
          this.applyFilters();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los productos'
        });
      }
    });
  }

  /**
   * Extraer categorías únicas
   */
  extractCategories(): void {
    const categoriesMap = new Map();
    this.products.forEach(product => {
      if (product.id_categoria && product.nombre_categoria) {
        categoriesMap.set(product.id_categoria, product.nombre_categoria);
      }
    });
    this.categories = Array.from(categoriesMap, ([id, nombre]) => ({ id, nombre }));
  }

  /**
   * Extraer marcas únicas
   */
  extractBrands(): void {
    const brandsMap = new Map();
    this.products.forEach(product => {
      if (product.id_marca && product.nombre_marca) {
        brandsMap.set(product.id_marca, product.nombre_marca);
      }
    });
    this.brands = Array.from(brandsMap, ([id, nombre]) => ({ id, nombre }));
  }

  /**
   * Cargar filtros desde query params
   */
  loadFiltersFromQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['categoria']) {
        this.selectedCategory = +params['categoria'];
      }
      if (params['marca']) {
        this.selectedBrand = +params['marca'];
      }
      if (params['search']) {
        this.searchTerm = params['search'];
      }
      this.applyFilters();
    });
  }

  /**
   * Aplicar filtros
   */
  applyFilters(): void {
    let filtered = [...this.products];

    // Filtro por categoría
    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.id_categoria === this.selectedCategory);
    }

    // Filtro por marca
    if (this.selectedBrand) {
      filtered = filtered.filter(p => p.id_marca === this.selectedBrand);
    }

    // Filtro por búsqueda
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.nombre.toLowerCase().includes(search) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(search))
      );
    }

    // Filtro por rango de precio
    filtered = filtered.filter(p =>
      p.precio_venta >= this.priceRange[0] &&
      p.precio_venta <= this.priceRange[1]
    );

    // Aplicar ordenamiento
    this.sortProducts(filtered);

    this.filteredProducts = filtered;
  }

  /**
   * Ordenar productos
   */
  sortProducts(products: any[]): void {
    switch (this.sortBy) {
      case 'nombre':
        products.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'precio_asc':
        products.sort((a, b) => a.precio_venta - b.precio_venta);
        break;
      case 'precio_desc':
        products.sort((a, b) => b.precio_venta - a.precio_venta);
        break;
      case 'recientes':
        products.sort((a, b) => b.id_producto - a.id_producto);
        break;
    }
  }

  /**
   * Cambiar categoría
   */
  onCategoryChange(): void {
    this.applyFilters();
  }

  /**
   * Cambiar marca
   */
  onBrandChange(): void {
    this.applyFilters();
  }

  /**
   * Buscar
   */
  onSearch(): void {
    this.applyFilters();
  }

  /**
   * Cambiar rango de precio
   */
  onPriceRangeChange(): void {
    this.applyFilters();
  }

  /**
   * Cambiar ordenamiento
   */
  onSortChange(): void {
    this.applyFilters();
  }

  /**
   * Limpiar filtros
   */
  clearFilters(): void {
    this.selectedCategory = null;
    this.selectedBrand = null;
    this.searchTerm = '';
    this.priceRange = [0, 1000];
    this.sortBy = 'nombre';
    this.applyFilters();
  }

  /**
   * Cambiar modo de vista
   */
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  /**
   * Ver detalle de producto
   */
  viewProductDetail(productId: number): void {
    this.router.navigate(['/cliente/producto', productId]);
  }

  /**
   * Agregar al carrito
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
}