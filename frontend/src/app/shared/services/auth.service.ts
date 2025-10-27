import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  private apiUrl = `${environment.apiUrl}`;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Inicializar primero isBrowser
    this.isBrowser = isPlatformBrowser(platformId);

    // Inicializar el BehaviorSubject con null
    this.currentUserSubject = new BehaviorSubject<any>(null);
    this.currentUser = this.currentUserSubject.asObservable();

    // Solo intentar acceder a localStorage si estamos en el navegador
    if (this.isBrowser) {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          this.currentUserSubject.next(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Error al acceder a localStorage', e);
      }
    }

  }

  private safeLocalStorageGet(key: string): string | null {
    return this.isBrowser ? localStorage.getItem(key) : null;
  }

  private safeLocalStorageSet(key: string, value: string): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.error('Error al guardar en localStorage', e);
      }
    }
  }

  private safeLocalStorageRemove(key: string): void {
    if (this.isBrowser) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Error al eliminar de localStorage', e);
      }
    }
  }

  login(usuario: string, contrasena: string) {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { usuario, contrasena })
      .pipe(map(user => {
        if (user && user.token) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
        return user;
      }));
  }
  logout() {
    this.safeLocalStorageRemove('currentUser');
    this.currentUserSubject.next(null);
  }

  get currentUserValue() {
    return this.currentUserSubject.value;
  }
}