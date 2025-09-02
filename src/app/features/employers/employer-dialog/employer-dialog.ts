import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

import { EmployersService } from '../../../core/services/employers.service';
import { Employer } from '../../../core/models/employer.model';

type DialogData = Partial<Employer>;

@Component({
  selector: 'app-employer-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './employer-dialog.html',
  styleUrls: ['./employer-dialog.scss'],
})
export class EmployerDialogComponent {
  private fb = inject(FormBuilder);
  private api = inject(EmployersService);
  private snack = inject(MatSnackBar);

  loading = false;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    activityType: ['', Validators.required],
    address: [''],
    phone: [''],
  });

  get f() { return this.form.controls; }

  constructor(
    private ref: MatDialogRef<EmployerDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData | null
  ) {
    if (data) this.form.patchValue({ ...data });
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const body = this.form.getRawValue();

    let req$: Observable<Employer>;
    this.loading = true;
    req$ = (this.data && this.data._id) ? this.api.update(this.data._id, body) : this.api.create(body);

    req$.subscribe({
      next: () => { this.loading = false; this.snack.open('Збережено', 'OK', { duration: 1800 }); this.ref.close(true); },
      error: () => { this.loading = false; this.snack.open('Помилка збереження', 'OK', { duration: 2200 }); },
    });
  }

  cancel() { this.ref.close(false); }
}
