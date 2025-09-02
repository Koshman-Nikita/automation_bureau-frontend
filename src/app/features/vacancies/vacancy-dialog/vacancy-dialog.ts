import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

import { VacanciesService } from '../../../core/services/vacancies.service';
import { Vacancy } from '../../../core/models/vacancy.model';

type DialogData = Partial<Vacancy>; // {_id?, employerId?, title?, activityType?, salaryFrom?, salaryTo?, notes?}

@Component({
  selector: 'app-vacancy-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './vacancy-dialog.html',
  styleUrls: ['./vacancy-dialog.scss'],
})
export class VacancyDialogComponent {
  private fb = inject(FormBuilder);
  private api = inject(VacanciesService);
  private snack = inject(MatSnackBar);

  loading = false;

  form = this.fb.nonNullable.group({
    employerId: ['', Validators.required],
    title: ['', Validators.required],
    activityType: ['', Validators.required],
    salaryFrom: this.fb.control<number | null>(null),
    salaryTo: this.fb.control<number | null>(null),
    notes: [''],
  });

  get f() { return this.form.controls; }

  constructor(
    private ref: MatDialogRef<VacancyDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData | null
  ) {

    if (data) {
      this.form.patchValue({
        employerId: data.employerId ?? '',
        title: data.title ?? '',
        activityType: data.activityType ?? '',
        salaryFrom: data.salaryFrom ?? null,
        salaryTo: data.salaryTo ?? null,
        notes: data.notes ?? '',
      });
    }
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const raw = this.form.getRawValue();
    const body: Partial<Vacancy> = {
      employerId: raw.employerId.trim(),
      title: raw.title.trim(),
      activityType: raw.activityType.trim(),
      salaryFrom: raw.salaryFrom ?? null,
      salaryTo: raw.salaryTo ?? null,
      notes: raw.notes?.trim() || '',
    };

    let req$: Observable<Vacancy>;
    this.loading = true;

    req$ = (this.data && this.data._id)
      ? this.api.update(this.data._id, body)
      : this.api.create(body);

    req$.subscribe({
      next: () => { this.loading = false; this.snack.open('Збережено', 'OK', { duration: 1800 }); this.ref.close(true); },
      error: () => { this.loading = false; this.snack.open('Помилка збереження', 'OK', { duration: 2200 }); },
    });
  }

  cancel() { this.ref.close(false); }
}
