import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) { }

  getClientes(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        if (response && response.success) {
          return response.data || [];
        }
        return [];
      })
    );
  }

  searchClientes(query: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/search`, {
      params: { q: query }
    }).pipe(
      map(response => {
        if (response && response.success) {
          return response.data || [];
        }
        return [];
      })
    );
  }
}