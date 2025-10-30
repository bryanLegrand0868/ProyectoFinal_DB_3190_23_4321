import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from "@angular/router";
import { AuthService } from "../services/auth.service";

// no-auth.guard.ts
@Injectable({
    providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean | UrlTree {
        const currentUser = this.authService.currentUserValue;
        if (!currentUser) {
            return true; // Allow access to login page
        }

        // Get the role, checking both possible locations and converting to lowercase
        const userRole = (currentUser.rol || (currentUser as any)?.user?.rol || currentUser.nombre_rol)?.toLowerCase();

        // Redirect based on role (case-insensitive)
        if (userRole === 'cliente') {
            return this.router.createUrlTree(['/tienda/inicio']);
        } else {
            return this.router.createUrlTree(['/dashboard']);
        }
    }
}