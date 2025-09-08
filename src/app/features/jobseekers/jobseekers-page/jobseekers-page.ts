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
import { Router } from '@angular/router';

import { JobseekersService } from '../../../core/services/jobseekers.service';
import { Jobseeker } from '../../../core/models/jobseeker.model';
import { JobseekerDialogComponent } from '../jobseeker-dialog/jobseeker-dialog';

@Component({
  standalone: true,
  selector: 'app-jobseekers-page',
  templateUrl: './jobseekers-page.html',
  styleUrls: ['./jobseekers-page.scss'],
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatDialogModule,
    MatTooltipModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, MatSnackBarModule
  ],
})
export class JobseekersPageComponent {
  private api = inject(JobseekersService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private router = inject(Router);

  cols = ['fullName', 'qualification', 'activityType', 'city', 'salaryDesired', 'status', 'actions'];

  items: Jobseeker[] = [];
  total = 0;
  page = 1;
  limit = 10;
  q = '';
  loading = false;

  ngOnInit() { this.load(); }

  back() { this.router.navigate(['/dashboard']); }

  load() {
    this.loading = true;
    this.api.list(this.page, this.limit, this.q).subscribe({
      next: (r) => { this.items = r.items; this.total = r.total; },
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

  add() {
    this.dialog.open(JobseekerDialogComponent, { width: '720px', data: null })
      .afterClosed().subscribe(ok => ok && this.load());
  }

  edit(row: Jobseeker) {
    this.dialog.open(JobseekerDialogComponent, { width: '720px', data: row })
      .afterClosed().subscribe(ok => ok && this.load());
  }

  remove(row: Jobseeker) {
    if (!row._id) return;
    if (!confirm(`Видалити "${row.fullName}"?`)) return;
    this.api.delete(row._id).subscribe(() => this.load());
  }
}
