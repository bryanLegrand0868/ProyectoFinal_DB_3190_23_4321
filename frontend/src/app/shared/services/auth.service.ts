import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

export interface User {
  id_usuario: number;
  usuario: string;
  id_rol: number;
  nombre_rol: string;
  id_empleado?: number;
  id_sucursal?: number;
  id_cliente?: number;
  permisos?: any[];
  token: string;
  rol?: string; // Para compatibilidad
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  private getStoredUser(): User | null {
    if (!this.isBrowser) return null;

    try {
      const user = localStorage.getItem('currentUser');
      if (user) {
        const parsedUser = JSON.parse(user);
        // Validar que el token aún existe y el usuario es válido
        if (parsedUser && parsedUser.token && parsedUser.nombre_rol) {
          return parsedUser;
        }
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
      this.clearStoredUser();
    }

    return null;
  }

  private clearStoredUser(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public isLoggedIn(): boolean {
    const user = this.currentUserValue;
    return !!(user && user.token);
  }

  public getUserRole(): string | null {
    const user = this.currentUserValue;
    return user ? user.nombre_rol : null;
  }

  public hasRole(requiredRoles: string[]): boolean {
    const userRole = this.getUserRole();
    if (!userRole) return false;

    return requiredRoles.some(role =>
      role.toLowerCase() === userRole.toLowerCase()
    );
  }

  public getRedirectUrl(user?: User): string {
    const currentUser = user || this.currentUserValue;
    if (!currentUser) return '/login';

    const role = currentUser.nombre_rol?.toLowerCase();
    console.log('Determining redirect for role:', role);

    switch (role) {
      case 'cliente':
        return '/tienda/inicio';
      case 'administrador':
      case 'gerente general':
      case 'gerente sucursal':
      case 'vendedor':
      case 'bodeguero':
      case 'contador':
        return '/dashboard';
      default:
        console.warn('Unknown role:', role, 'defaulting to dashboard');
        return '/dashboard';
    }
  }

  login(usuario: string, contrasena: string): Observable<any> {
    console.log('🔐 Login attempt for user:', usuario);

    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { usuario, contrasena })
      .pipe(
        map(response => {
          console.log('✅ Login response received:', response);

          if (response && response.success && response.token && response.user) {
            const user: User = {
              ...response.user,
              token: response.token,
              rol: response.user.nombre_rol // Para compatibilidad con guards
            };

            console.log('👤 User data to store:', user);
            console.log('🎭 User role:', user.nombre_rol);

            // Almacenar usuario
            if (this.isBrowser) {
              localStorage.setItem('currentUser', JSON.stringify(user));
              console.log('💾 User stored in localStorage');
            }

            this.currentUserSubject.next(user);
            console.log('📡 User data emitted to subscribers');

            return response;
          } else {
            throw new Error('Invalid login response format');
          }
        }),
        catchError(error => {
          console.error('❌ Login error:', error);

          // Limpiar cualquier dato corrupto
          this.clearStoredUser();
          this.currentUserSubject.next(null);

          const errorMessage = error.error?.message || 'Error de autenticación';
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  logout(): void {
    console.log('🚪 Logging out user');

    this.clearStoredUser();
    this.currentUserSubject.next(null);

    if (this.isBrowser) {
      // Forzar navegación y limpiar historial
      this.router.navigateByUrl('/login').then(() => {
        window.location.reload();
      });
    }
  }

  // Método para verificar si el token es válido (opcional)
  verifyToken(): Observable<boolean> {
    if (!this.isLoggedIn()) {
      return of(false); // Using 'of' from 'rxjs' for better type safety
    }

    return this.http.get<any>(`${environment.apiUrl}/auth/me`).pipe(
      map(response => {
        return response && response.success;
      }),
      catchError((error) => {
        console.error('❌ Token verification failed:', error);
        this.logout();
        return of(false); // Explicitly return Observable<boolean>
      })
    );
  }
}