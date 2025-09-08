import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AgreementsService } from '../../../core/services/agreements.service';
import { EmployersService } from '../../../core/services/employers.service';
import { JobseekersService } from '../../../core/services/jobseekers.service';
import { Agreement } from '../../../core/models/agreement.model';
import { Employer } from '../../../core/models/employer.model';
import { Jobseeker } from '../../../core/models/jobseeker.model';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-agreements-page',
  templateUrl: './agreements-page.html',
  styleUrls: ['./agreements-page.scss'],
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatDialogModule,
    MatTooltipModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, MatSnackBarModule,
  ],
})
export class AgreementsPageComponent {
  private api = inject(AgreementsService);
  private employersApi = inject(EmployersService);
  private jobseekersApi = inject(JobseekersService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  cols = ['employer', 'jobseeker', 'position', 'commission', 'actions'];

  items: Agreement[] = [];
  total = 0;
  page = 1;
  limit = 10;
  q = '';
  loading = false;

  // кеші для назв
  private employerMap = new Map<string, Employer>();
  private jobseekerMap = new Map<string, Jobseeker>();

  ngOnInit() { this.load(); }

  back() { history.back(); }

  load() {
    this.loading = true;
    this.api.list(this.page, this.limit, this.q).subscribe({
      next: (r) => {
        this.items = r.items || [];
        this.total = r.total || 0;

        // Попереднє завантаження назв для видимих рядків
        const empIds = Array.from(new Set(this.items.map(x => x.employerId).filter(Boolean))) as string[];
        const jsIds  = Array.from(new Set(this.items.map(x => x.jobseekerId).filter(Boolean))) as string[];
        empIds.forEach(id => this.ensureEmployer(id));
        jsIds.forEach(id  => this.ensureJobseeker(id));
      },
      error: () => this.snack.open('Помилка завантаження', 'OK', { duration: 2000 }),
      complete: () => this.loading = false,
    });
  }

  search() { this.page = 1; this.load(); }

  pageChange(e: PageEvent) {
    this.page = (e.pageIndex ?? 0) + 1;
    this.limit = e.pageSize ?? 10;
    this.load();
  }

  employerName(r: Agreement): string {
    const id = r.employerId;
    if (!id) return '—';
    const cached = this.employerMap.get(id);
    if (cached) return cached.name || '—';

    // підвантажимо ліниво
    this.ensureEmployer(id);
    return '...';
  }

  private ensureEmployer(id: string) {
    if (!id || this.employerMap.has(id)) return;
    this.employersApi.get(id).subscribe({
      next: emp => this.employerMap.set(id, emp),
      error: () => {}
    });
  }

  jobseekerName(r: Agreement): string {
    const id = r.jobseekerId;
    if (!id) return '—';
    const cached = this.jobseekerMap.get(id);
    if (cached) return cached.fullName || '—';

    this.ensureJobseeker(id);
    return '...';
  }

  private ensureJobseeker(id: string) {
    if (!id || this.jobseekerMap.has(id)) return;
    this.jobseekersApi.get(id).subscribe({
      next: js => this.jobseekerMap.set(id, js),
      error: () => {}
    });
  }

  add() {
    import('../agreement-dialog/agreement-dialog').then(m =>
      this.dialog.open(m.AgreementDialogComponent, { width: '720px', data: null })
        .afterClosed().subscribe(ok => ok && this.load())
    );
  }

  edit(row: Agreement) {
    import('../agreement-dialog/agreement-dialog').then(m =>
      this.dialog.open(m.AgreementDialogComponent, { width: '720px', data: row })
        .afterClosed().subscribe(ok => ok && this.load())
    );
  }

  remove(row: Agreement) {
    if (!row._id) return;
    if (!confirm(`Видалити угоду по посаді "${row.position}"?`)) return;
    this.api.delete(row._id).subscribe(() => this.load());
  }
}
