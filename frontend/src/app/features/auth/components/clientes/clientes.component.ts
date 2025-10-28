import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ClienteService } from '../../../../shared/services/cliente.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  standalone: false,
  providers: [MessageService]
})
export class ClientesComponent implements OnInit {
  clientes: any[] = [];
  loading = false;
  displayDialog = false;
  selectedCliente: any = {};
  searchQuery: string = '';  // Added for search functionality

  constructor(
    private clienteService: ClienteService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.loadClientes();
  }

loadClientes() {
    this.loading = true;
    this.clienteService.getClientes().subscribe({
      next: (response: any) => {
        // Handle the response format
        if (response && response.success && Array.isArray(response.data)) {
          this.clientes = response.data.map((cliente: any) => ({
            id_cliente: cliente.ID_USUARIO,
            nombres: cliente.USUARIO,
            apellidos: '', // Add if available
            email: '', // Add if available
            telefono: '', // Add if available
            rol: cliente.NOMBRE_ROL,
            estado: cliente.ESTADO
          }));
        } else {
          this.clientes = []; // Ensure it's always an array
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading clientes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los clientes'
        });
        this.clientes = []; // Ensure it's always an array
        this.loading = false;
      }
    });
  }

  // Added search method
  search() {
    if (!this.searchQuery.trim()) {
      this.loadClientes();
      return;
    }
    
    this.loading = true;
    // Assuming your API supports search by query
    this.clienteService.searchClientes(this.searchQuery).subscribe({
      next: (data) => {
        this.clientes = Array.isArray(data) ? data : [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching clientes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al buscar clientes'
        });
        this.loading = false;
      }
    });
  }

  // Alias for loadClientes to maintain compatibility with template
  load() {
    this.loadClientes();
  }
}