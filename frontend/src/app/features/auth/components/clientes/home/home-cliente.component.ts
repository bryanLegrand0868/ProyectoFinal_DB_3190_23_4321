import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-home-cliente',
  template: `
    <div class="home-container">
      <!-- Banner de bienvenida -->
      <section class="welcome-banner">
        <div class="banner-content">
          <h1>¡Bienvenido a SportSwear!</h1>
          <p>Encuentra los mejores productos deportivos</p>
          <button class="cta-button" (click)="goToProducts()">
            Explorar Productos
          </button>
        </div>
      </section>

      <!-- Categorías destacadas -->
      <section class="categories-section">
        <h2>Categorías Populares</h2>
        <div class="categories-grid">
          <div class="category-card" (click)="viewCategory(1)">
            <div class="category-icon">👟</div>
            <h3>Calzado Deportivo</h3>
            <p>Encuentra los mejores tenis</p>
          </div>
          
          <div class="category-card" (click)="viewCategory(2)">
            <div class="category-icon">👕</div>
            <h3>Ropa Deportiva</h3>
            <p>Playeras, pants y más</p>
          </div>
          
          <div class="category-card" (click)="viewCategory(3)">
            <div class="category-icon">⚽</div>
            <h3>Equipamiento</h3>
            <p>Balones, pesas, accesorios</p>
          </div>
          
          <div class="category-card" (click)="viewCategory(4)">
            <div class="category-icon">🧢</div>
            <h3>Accesorios</h3>
            <p>Gorras, calcetines, guantes</p>
          </div>
        </div>
      </section>

      <!-- Ofertas especiales -->
      <section class="offers-section">
        <h2>Ofertas Especiales</h2>
        <div class="offers-banner">
          <div class="offer-card">
            <h3>🔥 ¡Hasta 50% OFF!</h3>
            <p>En productos seleccionados</p>
            <button class="offer-button" (click)="goToProducts()">Ver ofertas</button>
          </div>
          
          <div class="offer-card">
            <h3>🚚 Envío Gratis</h3>
            <p>En compras mayores a Q200</p>
            <button class="offer-button" (click)="goToProducts()">Comprar ahora</button>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-banner {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 60px 40px;
      border-radius: 12px;
      text-align: center;
      margin-bottom: 40px;
    }

    .banner-content h1 {
      font-size: 3rem;
      margin-bottom: 16px;
      font-weight: bold;
    }

    .banner-content p {
      font-size: 1.2rem;
      margin-bottom: 24px;
      opacity: 0.9;
    }

    .cta-button {
      background: white;
      color: #667eea;
      border: none;
      padding: 12px 32px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .categories-section, .offers-section {
      margin-bottom: 40px;
    }

    .categories-section h2, .offers-section h2 {
      text-align: center;
      font-size: 2rem;
      margin-bottom: 32px;
      color: #333;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
    }

    .category-card {
      background: white;
      padding: 32px 24px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .category-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    .category-icon {
      font-size: 3rem;
      margin-bottom: 16px;
    }

    .category-card h3 {
      font-size: 1.25rem;
      margin-bottom: 8px;
      color: #333;
    }

    .category-card p {
      color: #666;
      font-size: 14px;
    }

    .offers-banner {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .offer-card {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      color: white;
      padding: 32px 24px;
      border-radius: 12px;
      text-align: center;
    }

    .offer-card h3 {
      font-size: 1.5rem;
      margin-bottom: 8px;
    }

    .offer-card p {
      margin-bottom: 20px;
      opacity: 0.9;
    }

    .offer-button {
      background: white;
      color: #43e97b;
      border: none;
      padding: 10px 24px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .offer-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    @media (max-width: 768px) {
      .home-container {
        padding: 10px;
      }
      
      .welcome-banner {
        padding: 40px 20px;
      }
      
      .banner-content h1 {
        font-size: 2rem;
      }
      
      .categories-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }
    }
  `],
  standalone: false,
  providers: [MessageService]
})
export class HomeClienteComponent implements OnInit {

  constructor(
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    console.log('🏠 HomeClienteComponent loaded');
  }

  /**
   * Navegar a productos
   */
  goToProducts(): void {
    this.router.navigate(['/tienda/catalogo']);
  }

  /**
   * Ver categoría específica
   */
  viewCategory(categoryId: number): void {
    this.router.navigate(['/tienda/catalogo'], {
      queryParams: { categoria: categoryId }
    });
  }
}