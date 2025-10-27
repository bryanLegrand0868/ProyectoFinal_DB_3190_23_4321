import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  standalone: false,
  
})
export class ClientesComponent implements OnInit {
  clientes: any[] = [];
  q = '';
  loading = false;
  private apiBase = '/api';

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  load() {
    this.loading = true;
    this.http.get<any[]>(`${this.apiBase}/clientes`).subscribe(
      r => { this.clientes = r || []; this.loading = false; },
      () => { this.clientes = []; this.loading = false; }
    );
  }

  search() {
    this.loading = true;
    const params = this.q ? `?q=${encodeURIComponent(this.q)}` : '';
    this.http.get<any[]>(`${this.apiBase}/clientes/search${params}`).subscribe(
      r => { this.clientes = r || []; this.loading = false; },
      () => { this.clientes = []; this.loading = false; }
    );
  }
}
