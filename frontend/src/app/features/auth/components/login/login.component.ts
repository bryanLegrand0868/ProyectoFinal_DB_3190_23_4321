import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';
import { MessageService } from 'primeng/api';

// PrimeNG Modules
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false,
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  error = '';
  showPassword = false;
  submitted = false;



  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    this.loginForm = this.formBuilder.group({
      usuario: ['', Validators.required],
      contrasena: ['', Validators.required]
    });
  }

   ngOnInit() {
    this.loginForm = this.formBuilder.group({
      usuario: ['', Validators.required],
      contrasena: ['', Validators.required]
    });
  }

  get f() { return this.loginForm.controls; }


  onSubmit() {
    // Mark all fields as touched to trigger validation messages
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const { usuario, contrasena } = this.loginForm.value;

    this.authService.login(usuario, contrasena).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        this.error = error?.error?.message || 'Error al iniciar sesión. Por favor, intente de nuevo.';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.error,
          life: 5000
        });
      }
    });
  }
}