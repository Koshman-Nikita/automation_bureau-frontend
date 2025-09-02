import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { JobseekersService } from '../../../core/services/jobseekers.service';
import { Jobseeker } from '../../../core/models/jobseeker.model';
import { JobseekerDialogComponent } from '../jobseeker-dialog/jobseeker-dialog';

@Component({
  selector: 'app-jobseekers-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatIconModule,
    MatButtonModule, MatDialogModule, MatTooltipModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatInputModule
  ],
  templateUrl: './jobseekers-page.html',
  styleUrls: ['./jobseekers-page.scss'],
})
export class JobseekersPageComponent {
  private api = inject(JobseekersService);
  private dialog = inject(MatDialog);

  cols = ['fullName', 'activityType', 'desiredSalary', 'qualification', 'actions'] as const;

  items: Jobseeker[] = [];
  loading = true;
  total = 0; page = 1; limit = 10; q = '';

  ngOnInit() { this.load(); }

  fullName(r: Jobseeker) { return `${r.lastName} ${r.firstName}${r.middleName ? ' ' + r.middleName : ''}`; }

  load() {
    this.loading = true;
    this.api.list(this.page, this.limit, this.q).subscribe({
      next: r => { this.items = r.items; this.total = r.total; this.loading = false; },
      error: () => this.loading = false
    });
  }

  pageChange(e: PageEvent) { this.page = e.pageIndex + 1; this.limit = e.pageSize; this.load(); }
  search() { this.page = 1; this.load(); }

  add() {
    this.dialog.open(JobseekerDialogComponent, { width: '560px' })
      .afterClosed().subscribe(ok => ok && this.load());
  }
  edit(row: Jobseeker) {
    this.dialog.open(JobseekerDialogComponent, { width: '560px', data: row })
      .afterClosed().subscribe(ok => ok && this.load());
  }
  remove(row: Jobseeker) {
    if (!confirm(`Видалити пошукача "${this.fullName(row)}"?`)) return;
    this.api.delete(row._id).subscribe(() => this.load());
  }
}
