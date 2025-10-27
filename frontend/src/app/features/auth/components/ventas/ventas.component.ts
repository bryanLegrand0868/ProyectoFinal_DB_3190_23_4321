import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  standalone: false
})
export class VentasComponent implements OnInit {
  ventas: any[] = [];
  loading = false;
  private apiBase = '/api'; // Ajustar base si es necesario

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // opcional: this.load();
  }

  load() {
    this.loading = true;
    this.http.get<any[]>(`${this.apiBase}/ventas`).subscribe(
      (r) => { this.ventas = r || []; this.loading = false; },
      () => { this.loading = false; this.ventas = []; }
    );
  }

  private downloadBlob(url: string, filename: string) {
    this.http.get(url, { responseType: 'blob' }).subscribe((blob) => {
      const u = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = u; a.download = filename; a.click();
      window.URL.revokeObjectURL(u);
    });
  }

  exportExcel() { this.downloadBlob(`${this.apiBase}/reportes/ventas?format=excel`, 'ventas.xlsx'); }
  exportPdf() { this.downloadBlob(`${this.apiBase}/reportes/ventas?format=pdf`, 'ventas.pdf'); }
}
