import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

import { ActivityTypesService } from '../../../core/services/activity-types.service';
import { ActivityType } from '../../../core/models/activity-type.model';

type DialogData = Partial<ActivityType>; // {_id?, name?, isActive?}

@Component({
  selector: 'app-activity-type-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './activity-type-dialog.html',
  styleUrls: ['./activity-type-dialog.scss'],
})
export class ActivityTypeDialogComponent {
  private fb = inject(FormBuilder);
  private api = inject(ActivityTypesService);
  private snack = inject(MatSnackBar);

  loading = false;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    isActive: true,
  });

  get f() {
    return this.form.controls;
  }

  constructor(
    private ref: MatDialogRef<ActivityTypeDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData | null
  ) {
    if (data) {
      this.form.patchValue({
        name: (data.name ?? '').trim(),
        isActive: data.isActive ?? true,
      });
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: Partial<ActivityType> = {
      name: raw.name.trim(),
      isActive: raw.isActive,
    };

    let req$: Observable<ActivityType>;
    this.loading = true;

    if (this.data && this.data._id) {
      req$ = this.api.update(this.data._id, payload);
    } else {
      req$ = this.api.create(payload);
    }

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.snack.open('Збережено', 'OK', { duration: 2000 });
        this.ref.close(true);
      },
      error: () => {
        this.loading = false;
        this.snack.open('Помилка збереження', 'OK', { duration: 2500 });
      },
    });
  }

  cancel(): void {
    this.ref.close(false);
  }
}
