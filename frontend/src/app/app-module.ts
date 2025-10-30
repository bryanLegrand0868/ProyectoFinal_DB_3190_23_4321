import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';

// Components
import { App } from './app';
import { DashboardComponent } from './features/auth/components/dashboard/dashboard.component';
import { VentasComponent } from './features/auth/components/ventas/ventas.component';
import { InventarioComponent } from './features/auth/components/inventario/inventario.component';
import { PedidosComponent } from './features/auth/components/pedidos/pedidos.component';
import { ReportesComponent } from './features/auth/components/reportes/reportes.component';
import { AdminComponent } from './features/auth/components/admin/admin.component';
import { LoginComponent } from './features/auth/components/login/login.component';

// Modules
import { ClientesModule } from './module/clientes.module';

// PrimeNG modules
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TooltipModule } from 'primeng/tooltip';
import { SliderModule } from 'primeng/slider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectButtonModule } from 'primeng/selectbutton';

// Interceptors
import { JwtInterceptor } from './shared/guards/jwt.interceptor';
import { ErrorInterceptor } from './shared/interceptors/error.interceptor';
import { routes } from './app-routing-module';

@NgModule({
  declarations: [
    App,
    LoginComponent,
    DashboardComponent,
    VentasComponent,
    InventarioComponent,
    PedidosComponent,
    ReportesComponent,
    AdminComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    
    // Feature Modules
    ClientesModule,
    
    // PrimeNG Modules
    ConfirmDialogModule,
    InputNumberModule,
    AutoCompleteModule,
    TooltipModule,
    CardModule,
    ChartModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    MessageModule,
    PasswordModule,
    InputGroupModule,
    InputGroupAddonModule,
    ToastModule,
    ProgressSpinnerModule,
    MenuModule,
    DialogModule,
    CheckboxModule,
    RadioButtonModule,
    SelectButtonModule,
    SliderModule
  ],
  providers: [
    MessageService,
    provideAnimations(),
    DatePipe,
    CurrencyPipe,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [App]
})
export class AppModule { }