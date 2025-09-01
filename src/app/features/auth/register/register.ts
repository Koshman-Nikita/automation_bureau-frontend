import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule, // ← Snackbar для локальних повідомлень
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['manager', [Validators.required]],
  });

  loading = false;

  submit() {
    if (this.form.invalid) {
      this.snack.open('Заповніть форму коректно', 'OK', { duration: 2500 });
      return;
    }

    this.loading = true;
    const { email, password, role } = this.form.getRawValue();

    this.auth.register(email!, password!, role!).subscribe({
      next: () => {
        this.snack.open('Обліковий запис створено', 'OK', { duration: 2000 });
        this.router.navigateByUrl('/dashboard');
      },
      error: (e) => {
        const msg = e?.error?.error || 'Помилка реєстрації';
        this.snack.open(msg, 'OK', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
