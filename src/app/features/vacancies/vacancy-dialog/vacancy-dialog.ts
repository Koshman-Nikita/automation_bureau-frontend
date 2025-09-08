import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, Validators, ReactiveFormsModule,
  FormControl, FormGroup
} from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';

import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { Vacancy } from '../../../core/models/vacancy.model';
import { Employer } from '../../../core/models/employer.model';
import { ActivityType } from '../../../core/models/activity-type.model';

import { VacanciesService } from '../../../core/services/vacancies.service';
import { EmployersService } from '../../../core/services/employers.service';
import { ActivityTypesService } from '../../../core/services/activity-types.service';

@Component({
  selector: 'app-vacancy-dialog',
  standalone: true,
  templateUrl: './vacancy-dialog.html',
  styleUrls: ['./vacancy-dialog.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatAutocompleteModule,
    MatChipsModule,
  ],
})
export class VacancyDialogComponent implements OnInit {
  private saving = false;
  get loading() { return this.saving; }

  employers: Employer[] = [];
  activityTypes: ActivityType[] = [];

  empSearch!: FormControl<string>;
  actSearch!: FormControl<string>;

  skills: string[] = [];

  form!: FormGroup<{
    employerId: FormControl<string | null>;
    title: FormControl<string>;
    activityType: FormControl<string | null>;
    salary: FormControl<number | null>;
    status: FormControl<'open' | 'closed'>;
    skillsText: FormControl<string>;
  }>;

  get f() { return this.form.controls; }

  constructor(
    private fb: FormBuilder,
    private api: VacanciesService,
    private employersApi: EmployersService,
    private actApi: ActivityTypesService,
    private ref: MatDialogRef<VacancyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Vacancy | null,
  ) {
    console.log('[VacancyDialog] ctor data:', data);

    this.empSearch = this.fb.control('', { nonNullable: true });
    this.actSearch = this.fb.control('', { nonNullable: true });

    this.form = this.fb.group({
      employerId: this.fb.control<string | null>(null, { validators: [Validators.required] }),
      title: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
      activityType: this.fb.control<string | null>(null),
      salary: this.fb.control<number | null>(null),
      status: this.fb.nonNullable.control<'open' | 'closed'>('open'),
      skillsText: this.fb.nonNullable.control(''),
    });

    console.log('[VacancyDialog] form created:', this.form.value);
  }

  ngOnInit(): void {
    console.log('[VacancyDialog] ngOnInit start');

    this.loadEmployers('');
    this.loadActivityTypes('');

    this.empSearch.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(q => q?.trim()
        ? this.employersApi.list(1, 20, q.trim())
        : of({ items: [], total: 0, page: 1, limit: 20 }))
    ).subscribe({
      next: res => this.employers = res.items ?? [],
      error: () => { this.employers = []; }
    });

    this.actSearch.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(q => q?.trim()
        ? this.actApi.list(1, 20, q.trim())
        : of({ items: [], total: 0, page: 1, limit: 20 }))
    ).subscribe({
      next: res => this.activityTypes = res.items ?? [],
      error: () => { this.activityTypes = []; }
    });

    if (this.data) {
      const { employerId, title, activityType, salary, status, skills } = this.data;
      this.skills = Array.isArray(skills) ? [...skills] : [];
      this.form.patchValue({
        employerId: employerId ?? null,
        title: title ?? '',
        activityType: activityType ?? null,
        salary: salary ?? null,
        status: (status as 'open' | 'closed') ?? 'open',
        skillsText: this.skills.join(', '),
      });
      console.log('[VacancyDialog] form patched from data:', this.form.value);
    }

    console.log('[VacancyDialog] ngOnInit done');
  }

  private loadEmployers(q: string) {
    console.log('[VacancyDialog] loadEmployers q:', q);
    this.employersApi.list(1, 20, q).subscribe({
      next: res => {
        console.log('[VacancyDialog] loadEmployers result:', res);
        this.employers = res.items ?? [];
      },
      error: () => { this.employers = []; }
    });
  }

  private loadActivityTypes(q: string) {
    console.log('[VacancyDialog] loadActivityTypes q:', q);
    this.actApi.list(1, 20, q).subscribe({
      next: res => {
        console.log('[VacancyDialog] loadActivityTypes result:', res);
        this.activityTypes = res.items ?? [];
      },
      error: () => { this.activityTypes = []; }
    });
  }

  onSkillEnter(event: KeyboardEvent | Event) {
    if ('preventDefault' in event) event.preventDefault();
    if ('stopPropagation' in event) event.stopPropagation?.();
    this.addSkillFromInput(event as any);
  }

  onSkillComma(event: KeyboardEvent | Event) {
    if (event && typeof (event as any).key === 'string') {
      const ke = event as KeyboardEvent;
      if (ke.key === ',') {
        ke.preventDefault();
        ke.stopPropagation?.();
        this.addSkillFromInput(event as any);
      }
    }
  }




  addSkillFromInput(e: Event) {
    const input = e.target as HTMLInputElement | null;
    const raw = (input?.value || '').trim();
    console.log('[VacancyDialog] addSkillFromInput raw:', raw);

    if (!raw) return;

    raw.split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .forEach(s => {
        if (!this.skills.includes(s)) {
          this.skills.push(s);
          console.log('[VacancyDialog] skill added:', s, '=>', this.skills);
        }
      });

    this.f.skillsText.setValue(this.skills.join(', '), { emitEvent: false });

    if (input) input.value = '';
  }

  removeSkill(s: string) {
    this.skills = this.skills.filter(x => x !== s);
    this.f.skillsText.setValue(this.skills.join(', '), { emitEvent: false });
  }

  cancel() { this.ref.close(false); }

  save() {
    if (this.form.invalid || this.saving) return;
    this.saving = true;

    const v = this.form.value;

    const payload: Vacancy = {
      employerId: v.employerId!,
      title: (v.title || '').trim(),
      position: (v.title || '').trim(),
      activityType: (v.activityType || '') || undefined,
      salary: v.salary ?? null,
      status: (v.status as 'open' | 'closed') ?? 'open',
      skills: this.skills,
    } as Vacancy;

    console.log('[VacancyDialog] save payload:', payload, 'data?._id:', this.data?._id);

    const req$ = this.data?._id
      ? this.api.update(this.data._id!, payload)
      : this.api.create(payload);

    req$.subscribe({
      next: (res) => {
        console.log('[VacancyDialog] save success:', res);
        this.saving = false;
        this.ref.close(true);
      },
      error: (err) => {
        console.log('[VacancyDialog] save error:', err);
        this.saving = false;
      }
    });
  }
}
