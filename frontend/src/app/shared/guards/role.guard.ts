import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        
        console.log('🎭 RoleGuard - Checking role access to:', state.url);
        
        const requiredRoles = route.data['roles'] as Array<string>;
        const currentUser = this.authService.currentUserValue;

        console.log('🎭 Required roles:', requiredRoles);
        console.log('👤 Current user:', currentUser);

        // Si no hay usuario logueado
        if (!currentUser || !this.authService.isLoggedIn()) {
            console.log('❌ No authenticated user, redirecting to login');
            return this.router.createUrlTree(['/login'], {
                queryParams: { returnUrl: state.url }
            });
        }

        const userRole = currentUser.nombre_rol?.toLowerCase();
        console.log('👑 User role (normalized):', userRole);

        // Si no se requieren roles específicos, permitir acceso
        if (!requiredRoles || requiredRoles.length === 0) {
            console.log('✅ No specific roles required, access granted');
            return true;
        }

        // Verificar si el usuario tiene el rol requerido
        const hasRole = this.authService.hasRole(requiredRoles);

        if (!hasRole) {
            console.log('❌ User role not authorized for this route');
            
            // Redirigir según el rol del usuario
            if (userRole === 'cliente') {
                console.log('🔄 Redirecting client to store');
                return this.router.createUrlTree(['/tienda/inicio']);
            } else {
                console.log('🔄 Redirecting to main dashboard');
                return this.router.createUrlTree(['/dashboard']);
            }
        }

        console.log('✅ Role access granted');
        return true;
    }
}