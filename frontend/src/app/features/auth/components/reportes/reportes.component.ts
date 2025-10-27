import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';

@Component({
    selector: 'app-reportes',
    templateUrl: './reportes-component.html',
    standalone: false
})
export class ReportesComponent {
    desde = '';
    hasta = '';
    private apiBase = '/api';

    constructor(private http: HttpClient) { }

    private download(url: string, name: string) {
        this.http.get(url, { responseType: 'blob' }).subscribe(blob => {
            const u = window.URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = u; a.download = name; a.click();
            window.URL.revokeObjectURL(u);
        });
    }

    downloadVentas() {
        const desde = this.desde ? `&desde=${this.desde}` : '';
        const hasta = this.hasta ? `&hasta=${this.hasta}` : '';
        this.download(`${this.apiBase}/reportes/ventas?format=excel${desde}${hasta}`, 'ventas_periodo.xlsx');
    }

    downloadTopClientes() {
        this.download(`${this.apiBase}/reportes/top10clientes?format=excel`, 'top10_clientes.xlsx');
    }

    downloadInventarioBajo() {
        this.download(`${this.apiBase}/reportes/inventario/bajo?format=excel`, 'inventario_bajo.xlsx');
    }
}
