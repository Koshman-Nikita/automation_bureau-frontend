import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';

import { Employer } from '../../../core/models/employer.model';
import { EmployersService } from '../../../core/services/employers.service';
import { ActivityTypesService } from '../../../core/services/activity-types.service';
import { ActivityType } from '../../../core/models/activity-type.model';

@Component({
  selector: 'app-employer-dialog',
  standalone: true,
  templateUrl: './employer-dialog.html',
  styleUrls: ['./employer-dialog.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
  ],
})
export class EmployerDialogComponent {
  private saving = false;
  get loading() { return this.saving; }

  form!: FormGroup<{
    name: FormControl<string>;
    activityType: FormControl<string | null>;
    phone: FormControl<string | null>;
    city: FormControl<string | null>;
    address: FormControl<string | null>;
  }>;

  filteredActivityTypes$!: Observable<ActivityType[]>;

  get f() { return this.form.controls; }

  constructor(
    private fb: FormBuilder,
    private api: EmployersService,
    private actApi: ActivityTypesService,
    private ref: MatDialogRef<EmployerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Employer | null,
  ) {
    this.form = this.fb.group({
      name: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
      activityType: this.fb.control<string | null>(null),
      phone: this.fb.control<string | null>(null),
      city: this.fb.control<string | null>(null),
      address: this.fb.control<string | null>(null),
    });

    if (data) {
      this.form.patchValue({
        name: data.name ?? '',
        activityType: data.activityType ?? null,
        phone: data.phone ?? null,
        city: data.city ?? null,
        address: data.address ?? null,
      });
    }

    // live-фільтрація типів діяльності
    this.filteredActivityTypes$ = this.form.get('activityType')!.valueChanges.pipe(
      startWith(this.form.get('activityType')!.value ?? ''),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(q => {
        const s = (q ?? '').toString().trim();
        return s ? this.actApi.list(1, 20, s) : this.actApi.list(1, 20, '');
      }),
      map(res => res.items ?? []),
    );
  }

  cancel() { this.ref.close(false); }

  save() {
    if (this.form.invalid || this.saving) return;
    this.saving = true;

    const v = this.form.value;
    const payload: Employer = {
      name: (v.name || '').trim(),
      activityType: (v.activityType || '') || undefined,
      phone: v.phone || undefined,
      city: v.city || undefined,
      address: v.address || undefined,
    };

    const req$ = this.data?._id
      ? this.api.update(this.data._id!, payload)
      : this.api.create(payload);

    req$.subscribe({
      next: () => { this.saving = false; this.ref.close(true); },
      error: () => { this.saving = false; },
    });
  }
}
