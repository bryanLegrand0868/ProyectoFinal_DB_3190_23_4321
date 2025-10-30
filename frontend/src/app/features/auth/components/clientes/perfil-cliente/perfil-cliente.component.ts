import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../../shared/services/auth.service';

@Component({
  selector: 'app-perfil-cliente',
  template: `
    <div class="perfil-container">
      <div class="perfil-header">
        <h1>👤 Mi Perfil</h1>
      </div>

      <div class="perfil-content">
        <div class="perfil-card">
          <h2>Información Personal</h2>
          
          <div class="info-section" *ngIf="currentUser">
            <div class="info-item">
              <label>Usuario:</label>
              <span>{{ currentUser.usuario }}</span>
            </div>
            
            <div class="info-item">
              <label>Rol:</label>
              <span>{{ currentUser.nombre_rol }}</span>
            </div>
            
            <div class="info-item">
              <label>ID:</label>
              <span>{{ currentUser.id_usuario }}</span>
            </div>
          </div>

          <div class="actions-section">
            <button class="btn-primary">Editar Información</button>
            <button class="btn-secondary">Cambiar Contraseña</button>
          </div>
        </div>

        <div class="perfil-card">
          <h2>Configuración de Cuenta</h2>
          
          <div class="config-section">
            <div class="config-item">
              <label>Notificaciones por Email</label>
              <input type="checkbox" checked>
            </div>
            
            <div class="config-item">
              <label>Ofertas y Promociones</label>
              <input type="checkbox" checked>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .perfil-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .perfil-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .perfil-header h1 {
      font-size: 2rem;
      color: #333;
      margin-bottom: 8px;
    }

    .perfil-content {
      display: grid;
      gap: 24px;
    }

    .perfil-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .perfil-card h2 {
      font-size: 1.25rem;
      margin-bottom: 20px;
      color: #333;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 8px;
    }

    .info-section {
      display: grid;
      gap: 16px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f5f5f5;
    }

    .info-item label {
      font-weight: 600;
      color: #666;
    }

    .info-item span {
      color: #333;
    }

    .actions-section {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .config-section {
      display: grid;
      gap: 16px;
    }

    .config-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
    }

    .btn-primary {
      background: #667eea;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-primary:hover {
      background: #5a6fd8;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-secondary:hover {
      background: #5a6268;
    }

    @media (max-width: 768px) {
      .perfil-container {
        padding: 10px;
      }
      
      .actions-section {
        flex-direction: column;
      }
    }
  `],
  standalone: false
})
export class PerfilClienteComponent implements OnInit {
  currentUser: any;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    console.log('👤 Perfil component loaded for:', this.currentUser?.usuario);
  }
}