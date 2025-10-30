import { ChangeDetectorRef, Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false,
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  loading = false;
  error = '';
  private subscription: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.loginForm = this.formBuilder.group({
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    console.log('🎯 LoginComponent initialized');
    
    // Limpiar cualquier sesión anterior al cargar el login
    this.clearPreviousSession();
    
    // Verificar si ya hay usuario logueado
    this.checkExistingSession();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private clearPreviousSession(): void {
    // Si llegamos al login, limpiar cualquier sesión anterior
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      console.log('🧹 Clearing previous session');
      this.authService.logout();
    }
  }

  private checkExistingSession(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && this.authService.isLoggedIn()) {
      console.log('🔍 Existing valid session found, redirecting...');
      this.redirectBasedOnRole();
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      console.log('❌ Form is invalid');
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    const { usuario, contrasena } = this.loginForm.value;
    console.log('🔐 Attempting login for user:', usuario);

    const loginSub = this.authService.login(usuario, contrasena).subscribe({
      next: (response) => {
        console.log('✅ Login successful:', response);
        this.handleSuccessfulLogin(response);
      },
      error: (error) => {
        console.error('❌ Login failed:', error);
        this.handleLoginError(error);
      }
    });

    this.subscription.add(loginSub);
  }

  private handleSuccessfulLogin(response: any): void {
    if (response && response.success && response.user) {
      const user = response.user;
      const redirectUrl = this.authService.getRedirectUrl(user);
      
      console.log('🎯 Login successful for role:', user.nombre_rol);
      console.log('🔄 Redirecting to:', redirectUrl);

      this.showSuccessMessage(`Bienvenido, ${user.usuario}!`);

      // Usar ngZone para asegurar que Angular detecte los cambios
      this.ngZone.run(() => {
        // Navegación inmediata sin reload
        this.router.navigateByUrl(redirectUrl).then(
          (success) => {
            if (success) {
              console.log('✅ Navigation successful');
              // REMOVIDO: Ya no forzamos reload automático
              // Solo marcamos que el login fue exitoso
              this.loading = false;
            } else {
              console.warn('⚠️ Navigation failed, using fallback');
              // Solo en caso de fallo extremo usar window.location
              window.location.href = redirectUrl;
            }
          }
        ).catch(err => {
          console.error('❌ Navigation error:', err);
          window.location.href = redirectUrl;
        });
      });
    } else {
      this.handleLoginError(new Error('Respuesta de login inválida'));
    }
  }

  private handleLoginError(error: any): void {
    this.loading = false;
    this.error = error?.message || 'Usuario o contraseña incorrectos';
    
    this.showErrorMessage(this.error);
    this.cdr.detectChanges();
    
    // Limpiar contraseña por seguridad
    this.loginForm.patchValue({ contrasena: '' });
  }

  private redirectBasedOnRole(): void {
    const user = this.authService.currentUserValue;
    if (!user) return;

    const redirectUrl = this.authService.getRedirectUrl(user);
    console.log('🔄 Redirecting existing session to:', redirectUrl);

    this.ngZone.run(() => {
      this.router.navigateByUrl(redirectUrl).then(() => {
        console.log('✅ Existing session redirected successfully');
      });
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  private showSuccessMessage(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: message,
      life: 3000
    });
  }

  private showErrorMessage(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000
    });
  }

  // Método para obtener errores de validación
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.touched && field?.errors) {
      if (field.errors['required']) {
        return `${fieldName} es requerido`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

  // Método para verificar si un campo tiene errores
  hasFieldError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.touched && field?.errors);
  }
}