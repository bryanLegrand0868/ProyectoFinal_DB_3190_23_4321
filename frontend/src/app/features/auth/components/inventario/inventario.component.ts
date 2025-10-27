import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  standalone: false
})
export class InventarioComponent implements OnInit {
  inventario: any[] = [];
  loading = false;
  private apiBase = '/api';

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  load() {
    this.loading = true;
    this.http.get<any[]>(`${this.apiBase}/inventario`).subscribe(
      (r) => { this.inventario = r || []; this.loading = false; },
      () => { this.loading = false; this.inventario = []; }
    );
  }

  exportBajo() {
    this.http.get(`${this.apiBase}/reportes/inventario/bajo?format=excel`, { responseType: 'blob' })
      .subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'inventario_bajo.xlsx'; a.click();
        window.URL.revokeObjectURL(url);
      });
  }
}
