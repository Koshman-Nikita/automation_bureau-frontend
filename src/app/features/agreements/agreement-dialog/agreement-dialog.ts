import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

import { AgreementsService } from '../../../core/services/agreements.service';
import { Agreement } from '../../../core/models/agreement.model';

type DialogData = Partial<Agreement>;

@Component({
  selector: 'app-agreement-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './agreement-dialog.html',
  styleUrls: ['./agreement-dialog.scss'],
})
export class AgreementDialogComponent {
  private fb = inject(FormBuilder);
  private api = inject(AgreementsService);
  private snack = inject(MatSnackBar);

  loading = false;

  form = this.fb.nonNullable.group({
    employerId: ['', Validators.required],
    jobseekerId: ['', Validators.required],
    vacancyId: ['', Validators.required],
    position: ['', Validators.required],
    commission: this.fb.control<number | null>(null, { validators: [Validators.required] }),
    notes: [''],
  });

  get f() { return this.form.controls; }

  constructor(
    private ref: MatDialogRef<AgreementDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData | null,
  ) {
    if (data) {
      this.form.patchValue({
        employerId: data.employerId ?? '',
        jobseekerId: data.jobseekerId ?? '',
        vacancyId: data.vacancyId ?? '',
        position: data.position ?? '',
        commission: data.commission ?? null,
        notes: data.notes ?? '',
      });
    }
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const raw = this.form.getRawValue();
    const body: Partial<Agreement> = {
      employerId: raw.employerId.trim(),
      jobseekerId: raw.jobseekerId.trim(),
      vacancyId: raw.vacancyId.trim(),
      position: raw.position.trim(),
      commission: raw.commission ?? null,
      notes: raw.notes?.trim() || '',
    };

    let req$: Observable<Agreement>;
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
