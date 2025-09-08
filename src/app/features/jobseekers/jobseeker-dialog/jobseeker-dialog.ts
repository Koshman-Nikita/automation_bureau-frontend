import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, Validators, ReactiveFormsModule,
  FormControl, FormGroup
} from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatRadioModule } from '@angular/material/radio';

import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { Jobseeker } from '../../../core/models/jobseeker.model';
import { JobseekersService } from '../../../core/services/jobseekers.service';
import { ActivityTypesService } from '../../../core/services/activity-types.service';
import { ActivityType } from '../../../core/models/activity-type.model';

@Component({
  selector: 'app-jobseeker-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
    MatRadioModule
  ],
  templateUrl: './jobseeker-dialog.html',
  styleUrls: ['./jobseeker-dialog.scss'],
})
export class JobseekerDialogComponent implements OnInit {
  private saving = false;
  get loading() { return this.saving; }

  activityTypes: ActivityType[] = [];

  @ViewChild(MatAutocompleteTrigger) actTrigger!: MatAutocompleteTrigger;

  form!: FormGroup<{
    fullName: FormControl<string>;
    qualification: FormControl<string>;
    activityType: FormControl<string | null>;
    city: FormControl<string | null>;
    salaryDesired: FormControl<number | null>;
    status: FormControl<'searching' | 'employed'>;
  }>;
  get f() { return this.form.controls; }

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<JobseekerDialogComponent>,
    private api: JobseekersService,
    private activityApi: ActivityTypesService,
    @Inject(MAT_DIALOG_DATA) public data: Jobseeker | null,
  ) {
    this.form = this.fb.group({
      fullName: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
      qualification: this.fb.nonNullable.control('', [Validators.required]),
      activityType: this.fb.control<string | null>(null),
      city: this.fb.control<string | null>(null),
      salaryDesired: this.fb.control<number | null>(null),
      status: this.fb.nonNullable.control<'searching' | 'employed'>('searching')
    });
  }

  ngOnInit(): void {
    this.loadActivityTypes('');

    this.f.activityType.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(val => {
        const q = (val ?? '').toString().trim();
        return q ? this.activityApi.list(1, 20, q)
          : of({ items: [], total: 0, page: 1, limit: 20 });
      })
    ).subscribe({
      next: res => this.activityTypes = res.items ?? [],
      error: () => { this.activityTypes = []; }
    });

    if (this.data) {
      const qualification = (this.data.qualifications?.[0] ?? '') as string;
      const activityType = (this.data.activityType ?? null) as string | null;

      this.form.patchValue({
        fullName: this.data.fullName ?? '',
        qualification,
        activityType,
        city: this.data.city ?? null,
        salaryDesired: this.data.salaryDesired ?? null,
        status: (this.data.status as 'searching' | 'employed') ?? 'searching'
      });
    }
  }

  private loadActivityTypes(q: string) {
    this.activityApi.list(1, 20, q).subscribe({
      next: res => this.activityTypes = res.items ?? [],
      error: () => { this.activityTypes = []; }
    });
  }

  onActivitySelected(e: MatAutocompleteSelectedEvent) {
    const name = (e.option?.value as string) ?? '';
    this.f.activityType.setValue(name);
  }

  openActivityPanel() {
    setTimeout(() => this.actTrigger?.openPanel(), 0);
  }

  cancel() { this.ref.close(false); }

  save() {
    if (this.form.invalid || this.saving) return;
    this.saving = true;

    const v = this.form.value;

    const qualifications = [(v.qualification || '').trim()].filter(Boolean) as string[];
    const act = (v.activityType || '').toString().trim();

    const payload: Jobseeker = {
      fullName: (v.fullName || '').trim(),
      qualifications,
      activityType: act ? act : null,
      city: v.city ?? undefined,
      salaryDesired: v.salaryDesired ?? undefined,
      status: (v.status || 'searching') as 'searching' | 'employed'
    };

    console.log('[JobseekerDialog] FINAL PAYLOAD =>', JSON.stringify(payload, null, 2));


    const req$ = this.data?._id
      ? this.api.update(this.data._id!, payload)
      : this.api.create(payload);

    req$.subscribe({
      next: () => { this.saving = false; this.ref.close(true); },
      error: () => { this.saving = false; }
    });
  }


}
