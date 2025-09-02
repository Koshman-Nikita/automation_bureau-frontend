import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

import { JobseekersService } from '../../../core/services/jobseekers.service';
import { Jobseeker } from '../../../core/models/jobseeker.model';

type DialogData = Partial<Jobseeker>;

@Component({
  selector: 'app-jobseeker-dialog',
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
  templateUrl: './jobseeker-dialog.html',
  styleUrls: ['./jobseeker-dialog.scss'],
})
export class JobseekerDialogComponent {
  private fb = inject(FormBuilder);
  private api = inject(JobseekersService);
  private snack = inject(MatSnackBar);

  loading = false;

  form = this.fb.nonNullable.group({
    lastName: ['', Validators.required],
    firstName: ['', Validators.required],
    middleName: [''],
    qualification: ['', Validators.required],
    activityType: ['', Validators.required],
    desiredSalary: this.fb.control<number | null>(null),
    notes: [''],
  });

  get f() { return this.form.controls; }

  constructor(
    private ref: MatDialogRef<JobseekerDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData | null,
  ) {
    if (data) {
      this.form.patchValue({
        lastName: data.lastName ?? '',
        firstName: data.firstName ?? '',
        middleName: data.middleName ?? '',
        qualification: data.qualification ?? '',
        activityType: data.activityType ?? '',
        desiredSalary: data.desiredSalary ?? null,
        notes: data.notes ?? '',
      });
    }
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const raw = this.form.getRawValue();
    const body: Partial<Jobseeker> = {
      lastName: raw.lastName.trim(),
      firstName: raw.firstName.trim(),
      middleName: raw.middleName?.trim() || '',
      qualification: raw.qualification.trim(),
      activityType: raw.activityType.trim(),
      desiredSalary: raw.desiredSalary ?? null,
      notes: raw.notes?.trim() || '',
    };

    let req$: Observable<Jobseeker>;
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
