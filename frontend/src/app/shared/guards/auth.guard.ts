import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    console.log('🛡️ AuthGuard - Checking access to:', state.url);
    
    const currentUser = this.authService.currentUserValue;
    console.log('👤 Current user:', currentUser);

    // Si no hay usuario logueado
    if (!currentUser || !this.authService.isLoggedIn()) {
      console.log('❌ No authenticated user, redirecting to login');
      return this.router.createUrlTree(['/login'], { 
        queryParams: { returnUrl: state.url } 
      });
    }

    // Verificar roles si están definidos en la ruta
    const requiredRoles = route.data['roles'] as Array<string>;
    console.log('🎭 Required roles:', requiredRoles);
    console.log('👑 User role:', currentUser.nombre_rol);

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = this.authService.hasRole(requiredRoles);
      
      if (!hasRequiredRole) {
        console.log('❌ User does not have required role');
        
        // Redirigir según el rol del usuario
        const userRole = currentUser.nombre_rol?.toLowerCase();
        if (userRole === 'cliente') {
          console.log('🔄 Redirecting client to store');
          return this.router.createUrlTree(['/tienda/inicio']);
        } else {
          console.log('🔄 Redirecting to dashboard');
          return this.router.createUrlTree(['/dashboard']);
        }
      }
    }

    console.log('✅ Access granted to:', state.url);
    return true;
  }
}