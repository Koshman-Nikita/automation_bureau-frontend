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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { AgreementsService } from '../../../core/services/agreements.service';
import { EmployersService } from '../../../core/services/employers.service';
import { VacanciesService } from '../../../core/services/vacancies.service';
import { JobseekersService } from '../../../core/services/jobseekers.service';

import { Agreement } from '../../../core/models/agreement.model';
import { Employer } from '../../../core/models/employer.model';
import { Jobseeker } from '../../../core/models/jobseeker.model';
import { Vacancy } from '../../../core/models/vacancy.model';

type UIJobseeker = { _id: string; label: string };

@Component({
  selector: 'app-agreement-dialog',
  standalone: true,
  templateUrl: './agreement-dialog.html',
  styleUrls: ['./agreement-dialog.scss'],
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
    MatProgressSpinnerModule,
  ],
})
export class AgreementDialogComponent implements OnInit {
  private saving = false;
  get loading() { return this.saving; }

  // списки
  employers: Employer[] = [];
  jobseekers: UIJobseeker[] = [];
  vacancies: Vacancy[] = [];
  positions: string[] = [];

  // пошук
  empSearch = new FormControl<string>('', { nonNullable: true });
  jsSearch  = new FormControl<string>('', { nonNullable: true });

  form!: FormGroup<{
    employerId: FormControl<string | null>;
    jobseekerId: FormControl<string | null>;
    position: FormControl<string>;
    commission: FormControl<number | null>;
  }>;

  get f() { return this.form.controls; }

  constructor(
    private fb: FormBuilder,
    private api: AgreementsService,
    private employersApi: EmployersService,
    private vacanciesApi: VacanciesService,
    private jobseekersApi: JobseekersService,
    private ref: MatDialogRef<AgreementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Agreement | null,
  ) {
    this.form = this.fb.group({
      employerId: this.fb.control<string | null>(null, { validators: [Validators.required] }),
      jobseekerId: this.fb.control<string | null>(null, { validators: [Validators.required] }),
      position: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
      // Комісія — звичайне число (НЕ відсоток)
      commission: this.fb.control<number | null>(null),
    });
  }

  ngOnInit(): void {
    // стартові дані
    this.loadEmployers('');
    this.loadJobseekers('');

    // live-пошук роботодавців
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

    // live-пошук пошукачів (показуємо ім'я в списку, але у форму кладемо _id)
    this.jsSearch.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(q => q?.trim()
        ? this.jobseekersApi.list(1, 20, q.trim())
        : of({ items: [], total: 0, page: 1, limit: 20 }))
    ).subscribe({
      next: res => this.jobseekers = (res.items ?? []).map(this.mapJobseeker),
      error: () => { this.jobseekers = []; }
    });

    // при зміні роботодавця — підтягнути його вакансії і згенерити підказки для "Посада"
    this.f.employerId.valueChanges.subscribe(val => {
      this.positions = [];
      this.vacancies = [];
      if (val) this.loadVacanciesByEmployer(val);
    });

    // якщо редагуємо — заповнити форму
    if (this.data) {
      this.form.patchValue({
        employerId: this.data.employerId ?? null,
        jobseekerId: this.data.jobseekerId ?? null,
        position: this.data.position ?? '',
        commission: this.data.commission ?? null,
      });
      if (this.data.employerId) this.loadVacanciesByEmployer(this.data.employerId);
      // Підтягнемо поточного шукача, щоб у списку був видимий лейбл
      if (this.data.jobseekerId) {
        this.jobseekersApi.get(this.data.jobseekerId).subscribe({
          next: (js) => {
            const ui = this.mapJobseeker(js);
            if (!this.jobseekers.find(x => x._id === ui._id)) {
              this.jobseekers = [ui, ...this.jobseekers];
            }
          }
        });
      }
    }
  }

  private mapJobseeker(js: Jobseeker): UIJobseeker {
    // Формуємо підпис для випадаючого списку
    // Якщо є skills[0]/skills[1] — використаємо як кваліфікацію/активіті, але для лейбла достатньо fullName
    const label = js.fullName || '—';
    return { _id: js._id!, label };
  }

  private loadEmployers(q: string) {
    this.employersApi.list(1, 20, q).subscribe({
      next: r => this.employers = r.items ?? [],
      error: () => this.employers = [],
    });
  }

  private loadJobseekers(q: string) {
    this.jobseekersApi.list(1, 20, q).subscribe({
      next: r => this.jobseekers = (r.items ?? []).map(this.mapJobseeker),
      error: () => this.jobseekers = [],
    });
  }

  private loadVacanciesByEmployer(employerId: string) {
    // Фільтруємо по роботодавцю на клієнті (бек уже вміє шукати по q; за потреби можна передати q=`employer:${id}`)
    this.vacanciesApi.list(1, 100, '').subscribe({
      next: r => {
        this.vacancies = (r.items || []).filter(v => v.employerId === employerId);
        const set = new Set<string>();
        this.vacancies.forEach(v => set.add((v.position || v.title || '').trim()));
        this.positions = Array.from(set).filter(Boolean);
      },
      error: () => { this.vacancies = []; this.positions = []; },
    });
  }

  // якщо користувач вибрав конкретну вакансію (залежить від реалізації; у розмітці ми автокомплітимо саме текст посади)
  onVacancyPick(vacancyId: string) {
    const v = this.vacancies.find(x => x._id === vacancyId);
    if (v?.position || v?.title) {
      this.f.position.setValue((v.position || v.title) as string);
    }
  }

  cancel() { this.ref.close(false); }

  save() {
    if (this.form.invalid || this.saving) return;
    this.saving = true;

    const v = this.form.value;
    const payload: Agreement = {
      employerId: v.employerId!,
      jobseekerId: v.jobseekerId!,
      position: (v.position || '').trim(),
      commission: v.commission ?? null,
    };

    const req$ = this.data?._id
      ? this.api.update(this.data._id!, payload as any)
      : this.api.create(payload as any);

    req$.subscribe({
      next: () => { this.saving = false; this.ref.close(true); },
      error: () => { this.saving = false; }
    });
  }
}
