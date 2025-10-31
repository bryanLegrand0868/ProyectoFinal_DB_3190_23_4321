import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError((err: HttpErrorResponse) => {
                console.log('🚫 Error interceptor caught:', err.status, err.url);

                // Solo hacer logout automático en casos específicos de autenticación
                if (err.status === 401 && this.shouldAutoLogout(err, request)) {
                    console.log('🔐 Unauthorized - auto logout triggered');
                    // Auto logout si token expiró o es inválido
                    this.authService.logout();
                    this.router.navigate(['/login']);
                }

                // Para errores 403, solo mostrar mensaje pero no hacer logout
                if (err.status === 403) {
                    console.log('🚫 Forbidden - access denied but not logging out');
                }

                // Para errores de conectividad (0, 404, 500), no hacer logout
                if (err.status === 0 || err.status === 404 || err.status === 500) {
                    console.log('📡 Network/Server error - not logging out');
                }

                const error = err.error?.message || err.statusText || 'Error desconocido';
                return throwError(() => ({ ...err, message: error }));
            })
        );
    }

    /**
     * Determinar si se debe hacer logout automático
     */
    private shouldAutoLogout(error: HttpErrorResponse, request: HttpRequest<any>): boolean {
        // NO hacer logout automático para errores en estos endpoints
        const skipAutoLogoutUrls = [
            '/orders',
            '/products', 
            '/dashboard',
            '/upload'
        ];

        const shouldSkip = skipAutoLogoutUrls.some(url => 
            request.url.includes(url)
        );

        if (shouldSkip) {
            console.log('⏭️ Skipping auto logout for URL:', request.url);
            return false;
        }

        // Solo hacer logout si el error indica que el token es inválido
        const tokenInvalidMessages = [
            'invalid token',
            'token expired', 
            'unauthorized access',
            'jwt expired'
        ];

        const errorMessage = (error.error?.message || error.message || '').toLowerCase();
        const isTokenInvalid = tokenInvalidMessages.some(msg => 
            errorMessage.includes(msg)
        );

        console.log('🔍 Token invalid check:', isTokenInvalid, errorMessage);
        return isTokenInvalid;
    }
}