import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormControl,
  FormGroup,
} from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ActivityType } from '../../../core/models/activity-type.model';
import { ActivityTypesService } from '../../../core/services/activity-types.service';

@Component({
  selector: 'app-activity-type-dialog',
  standalone: true,
  templateUrl: './activity-type-dialog.html',
  styleUrls: ['./activity-type-dialog.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class ActivityTypeDialogComponent {
  private saving = false;
  get loading() { return this.saving; }

  form!: FormGroup<{
    name: FormControl<string>;
  }>;

  get f() { return this.form.controls; }

  constructor(
    private fb: FormBuilder,
    private api: ActivityTypesService,
    private ref: MatDialogRef<ActivityTypeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ActivityType | null,
  ) {
    this.form = this.fb.group({
      name: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
    });

    if (data?.name) {
      this.form.patchValue({ name: data.name });
    }
  }

  cancel() {
    this.ref.close(false);
  }

  save() {
    if (this.form.invalid || this.saving) return;
    this.saving = true;

    const payload: ActivityType = {
      _id: this.data?._id,
      name: (this.f.name.value || '').trim(),
    } as ActivityType;

    const req$ = this.data?._id
      ? this.api.update(this.data._id!, payload as ActivityType)
      : this.api.create(payload as ActivityType);

    req$.subscribe({
      next: () => { this.saving = false; this.ref.close(true); },
      error: () => { this.saving = false; },
    });
  }
}
