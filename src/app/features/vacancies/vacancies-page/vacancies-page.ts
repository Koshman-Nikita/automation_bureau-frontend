import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { VacanciesService } from '../../../core/services/vacancies.service';
import { Vacancy } from '../../../core/models/vacancy.model';
import { VacancyDialogComponent } from '../vacancy-dialog/vacancy-dialog';

@Component({
  standalone: true,
  selector: 'app-vacancies-page',
  templateUrl: './vacancies-page.html',
  styleUrls: ['./vacancies-page.scss'],
  imports: [
    CommonModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, FormsModule,
    MatProgressSpinnerModule,
  ]
})
export class VacanciesPage {
  private api = inject(VacanciesService);
  private dialog = inject(MatDialog);

  cols = ['title', 'employerId', 'activityType', 'salary', 'actions'];
  items = signal<Vacancy[]>([]);
  total = signal(0);
  page = signal(1);
  limit = signal(10);
  q = '';
  loading = false;

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.list(this.page(), this.limit(), this.q).subscribe(r => {
      this.items.set(r.items);
      this.total.set(r.total);
      this.loading = false;
    });
  }

  pageChange(e: PageEvent) {
    this.page.set((e.pageIndex ?? 0) + 1);
    this.limit.set(e.pageSize ?? 10);
    this.load();
  }

  search() { this.page.set(1); this.load(); }

  add() {
    this.dialog.open(VacancyDialogComponent, { width: '560px' })
      .afterClosed().subscribe(ok => ok && this.load());
  }

  edit(row: Vacancy) {
    this.dialog.open(VacancyDialogComponent, { width: '560px', data: row })
      .afterClosed().subscribe(ok => ok && this.load());
  }

  remove(row: Vacancy) {
    if (!row._id) return;
    if (!confirm(`Видалити вакансію "${row.title}"?`)) return;
    this.api.delete(row._id).subscribe(() => this.load());
  }

  salary(r: Vacancy) {
    const from = r.salaryFrom ?? '';
    const to = r.salaryTo ?? '';
    return from || to ? `${from || '—'}–${to || '—'}` : '—';
  }
}
