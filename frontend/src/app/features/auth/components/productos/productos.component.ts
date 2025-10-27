import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';

// PrimeNG Modules
import { MessageService } from 'primeng/api';

// Services
import { environment } from '../../../../../environments/environment';
import { ProductService, Producto } from '../../../../shared/services/product.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos-components.html',
  standalone: false,

  providers: [MessageService, ProductService]
})
export class ProductosComponent implements OnInit {
  // Lista de productos
  productos: Producto[] = [];

  // Estado del componente
  loading = false;
  displayDialog = false;
  submitted = false;
  selectedProduct: Producto = this.getEmptyProduct();

  // Opciones para los filtros
  categorias = [
    { label: 'Electrónica', value: 'Electrónica' },
    { label: 'Ropa', value: 'Ropa' },
    { label: 'Hogar', value: 'Hogar' },
    { label: 'Alimentos', value: 'Alimentos' },
    { label: 'Otros', value: 'Otros' }
  ];

  constructor(
    private productService: ProductService,
    private messageService: MessageService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  /**
   * Carga la lista de productos desde el servidor
   */
  loadProducts() {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (data: Producto[]) => {
        this.productos = data || [];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar productos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los productos',
          life: 3000
        });
        this.loading = false;
      }
    });
  }

  /**
   * Muestra el diálogo para crear un nuevo producto
   */
  showNewProductDialog() {
    this.selectedProduct = this.getEmptyProduct();
    this.displayDialog = true;
    this.submitted = false;
  }

  /**
   * Edita un producto existente
   */
  editProduct(product: Producto) {
    this.selectedProduct = { ...product };
    this.displayDialog = true;
    this.submitted = false;
  }

  /**
   * Guarda un producto (creación o actualización)
   */
  saveProduct() {
    this.submitted = true;

    if (!this.isProductValid()) {
      return;
    }

    const productData = { ...this.selectedProduct };
    
    if (productData.id_producto) {
      // Actualizar producto existente
      this.productService.updateProduct(productData.id_producto, productData).subscribe({
        next: (updatedProduct: Producto) => {
          const index = this.productos.findIndex(p => p.id_producto === updatedProduct.id_producto);
          if (index !== -1) {
            this.productos[index] = updatedProduct;
          } else {
            this.productos = [...this.productos, updatedProduct];
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Producto actualizado correctamente',
            life: 3000
          });
          this.displayDialog = false;
        },
        error: (error: any) => {
          console.error('Error al actualizar producto:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el producto',
            life: 3000
          });
        }
      });
    } else {
      // Crear nuevo producto
      this.productService.createProduct(productData).subscribe({
        next: (newProduct: Producto) => {
          this.productos = [...this.productos, newProduct];
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Producto creado correctamente',
            life: 3000
          });
          this.displayDialog = false;
        },
        error: (error: any) => {
          console.error('Error al crear producto:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el producto',
            life: 3000
          });
        }
      });
    }
  }

  /**
   * Elimina un producto
   */
  deleteProduct(product: Producto) {
    if (product.id_producto) {
      this.productService.deleteProduct(product.id_producto).subscribe({
        next: () => {
          this.productos = this.productos.filter(p => p.id_producto !== product.id_producto);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Producto eliminado correctamente',
            life: 3000
          });
        },
        error: (error: any) => {
          console.error('Error al eliminar producto:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar el producto',
            life: 3000
          });
        }
      });
    }
  }

  /**
   * Exporta la lista de productos a Excel
   */
  exportExcel() {
    this.http.get(`${environment.apiUrl}/reportes/productos?format=excel`, { responseType: 'blob' })
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a'); 
          a.href = url; 
          a.download = 'productos.xlsx'; 
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error: any) => {
          console.error('Error al exportar a Excel:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo exportar el reporte',
            life: 3000
          });
        }
      });
  }

  /**
   * Crea un producto vacío
   */
  private getEmptyProduct(): Producto {
    return {
      nombre: '',
      descripcion: '',
      precio_venta: 0,
      stock: 0,
      categoria: 'General',
      sku: ''
    };
  }

  /**
   * Valida si el producto es válido
   */
  isProductValid(): boolean {
    return (
      this.selectedProduct.nombre?.trim() !== '' &&
      this.selectedProduct.precio_venta > 0 &&
      this.selectedProduct.stock >= 0
    );
  }
}