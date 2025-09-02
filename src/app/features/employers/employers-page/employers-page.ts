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

import { EmployersService } from '../../../core/services/employers.service';
import { Employer } from '../../../core/models/employer.model';
import { EmployerDialogComponent } from '../employer-dialog/employer-dialog';

@Component({
  selector: 'app-employers-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatDialogModule,
    MatTooltipModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule
  ],
  templateUrl: './employers-page.html',
  styleUrls: ['./employers-page.scss'],
})
export class EmployersPageComponent {
  private api = inject(EmployersService);
  private dialog = inject(MatDialog);

  cols = ['name', 'activityType', 'phone', 'address', 'actions'] as const;

  items: Employer[] = [];
  loading = true;
  total = 0;
  page = 1;
  limit = 10;
  q = '';

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.list(this.page, this.limit, this.q).subscribe({
      next: (r) => { this.items = r.items; this.total = r.total; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  pageChange(e: PageEvent) {
    this.page = e.pageIndex + 1;
    this.limit = e.pageSize;
    this.load();
  }

  search() { this.page = 1; this.load(); }

  add() {
    this.dialog.open(EmployerDialogComponent, { width: '520px' })
      .afterClosed().subscribe(ok => ok && this.load());
  }

  edit(row: Employer) {
    this.dialog.open(EmployerDialogComponent, { width: '520px', data: row })
      .afterClosed().subscribe(ok => ok && this.load());
  }

  remove(row: Employer) {
    if (!confirm(`Видалити роботодавця "${row.name}"?`)) return;
    this.api.delete(row._id).subscribe(() => this.load());
  }
}
