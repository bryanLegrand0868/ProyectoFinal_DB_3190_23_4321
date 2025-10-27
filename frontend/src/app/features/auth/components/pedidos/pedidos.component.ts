import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  standalone: false
})
export class PedidosComponent implements OnInit {
  pedidos: any[] = [];
  loading = false;
  private apiBase = '/api';

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  load() {
    this.loading = true;
    this.http.get<any[]>(`${this.apiBase}/pedidos`).subscribe(
      r => { this.pedidos = r || []; this.loading = false; },
      () => { this.pedidos = []; this.loading = false; }
    );
  }

  exportExcel() {
    this.http.get(`${this.apiBase}/reportes/pedidos?format=excel`, { responseType: 'blob' })
      .subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'pedidos.xlsx'; a.click();
        window.URL.revokeObjectURL(url);
      });
  }
}
