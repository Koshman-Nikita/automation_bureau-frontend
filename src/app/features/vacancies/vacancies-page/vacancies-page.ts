import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { VacanciesService } from '../../../core/services/vacancies.service';
import { EmployersService } from '../../../core/services/employers.service';
import { Vacancy } from '../../../core/models/vacancy.model';
import { Employer } from '../../../core/models/employer.model';

import { VacancyDialogComponent } from '../vacancy-dialog/vacancy-dialog';

@Component({
  standalone: true,
  selector: 'app-vacancies-page',
  templateUrl: './vacancies-page.html',
  styleUrls: ['./vacancies-page.scss'],
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule,
    MatDialogModule, MatTooltipModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule
  ],
})
export class VacanciesPageComponent {
  private api = inject(VacanciesService);
  private employersApi = inject(EmployersService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  cols = ['title', 'employer', 'activityType', 'salary', 'status', 'skills', 'actions'];

  items: Vacancy[] = [];
  employerMap = new Map<string, Employer>();

  total = 0;
  page = 1;
  limit = 10;
  q = '';
  loading = false;

  ngOnInit() { this.load(); }

  back() { this.router.navigate(['../']); }

  load() {
    this.loading = true;
    console.log('[VacanciesPage] Loading vacancies... page:', this.page, 'limit:', this.limit, 'q:', this.q);
    this.api.list(this.page, this.limit, this.q).subscribe({
      next: (res) => {
        console.log('[VacanciesPage] API list response:', res);
        this.items = res.items ?? [];
        this.total = res.total ?? 0;

        // зібрати унікальні employerId і підтягнути компанії
        const ids = Array.from(
          new Set(
            (this.items || [])
              .map(v => v.employerId)
              .filter((x): x is string => typeof x === 'string' && !!x)
          )
        );
        console.log('[VacanciesPage] Employer IDs to fetch:', ids);

        if (ids.length === 0) {
          this.employerMap.clear();
          return;
        }

        forkJoin(
          ids.map(id => {
            console.log('[VacanciesPage] GET employer by id:', id);
            return this.employersApi.getById(id).pipe(
              catchError(err => {
                console.log('[VacanciesPage] getById ERROR:', id, err);
                return of(null);
              }),
              map(item => ({ id, item }))
            );
          })
        ).subscribe({
          next: list => {
            const mapObj = new Map<string, Employer>();
            list.forEach(x => { if (x?.item) mapObj.set(x.id, x.item as Employer); });
            this.employerMap = mapObj;
            console.log('[VacanciesPage] Employers fetched (mapped):', list.map(l => l?.item));
            console.log('[VacanciesPage] Employer map after update:', this.employerMap);
          },
          error: () => {},
          complete: () => { this.loading = false; }
        });
      },
      error: () => { this.loading = false; },
      complete: () => {}
    });
  }

  search() { this.page = 1; this.load(); }

  pageChange(e: PageEvent) {
    this.page = (e.pageIndex ?? 0) + 1;
    this.limit = e.pageSize ?? 10;
    this.load();
  }

  add() {
    this.dialog.open(VacancyDialogComponent, { width: '760px', data: null })
      .afterClosed().subscribe(ok => ok && this.load());
  }

  edit(row: Vacancy) {
    this.dialog.open(VacancyDialogComponent, { width: '760px', data: row })
      .afterClosed().subscribe(ok => ok && this.load());
  }

  remove(row: Vacancy) {
    if (!row?._id) return;
    if (!confirm(`Видалити вакансію "${row.title}"?`)) return;
    this.api.delete(row._id).subscribe(() => this.load());
  }

  employerName(v: Vacancy) {
    const id = v?.employerId;
    if (!id) {
      console.log('[VacanciesPage] Employer not found for vacancy:', id);
      return '—';
    }
    const e = this.employerMap.get(id);
    if (!e) {
      console.log('[VacanciesPage] Employer not found for vacancy:', id);
      return '—';
    }
    return e.name || '—';
  }

  salary(v: Vacancy) {
    const s = v?.salary;
    return (s || s === 0) ? `${s}` : '—';
    // якщо треба форматувати валюту — зробіть пайп або локалізацію
  }

  skillsStr(v: Vacancy) {
    const arr = Array.isArray(v?.skills) ? v!.skills : [];
    return arr.length ? arr.join(', ') : '—';
  }
}
