import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmployersService } from '../../../core/services/employers.service';
import { Employer } from '../../../core/models/employer.model';
import { EmployerDialogComponent } from '../employer-dialog/employer-dialog';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-employers-page',
  standalone: true,
  templateUrl: './employers-page.html',
  styleUrls: ['./employers-page.scss'],
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
})
export class EmployersPage implements OnInit {
  q = '';
  page = 1;
  limit = 10;
  total = 0;

  loading = false;

  cols = ['name', 'activityType', 'phone', 'address', 'actions'] as const;
  items: Employer[] = [];

  constructor(private api: EmployersService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.load();
  }

  search() {
    this.page = 1;
    this.load();
  }

  pageChange(ev: PageEvent) {
    this.page = ev.pageIndex + 1;
    this.limit = ev.pageSize;
    this.load();
  }

  load() {
    this.loading = true;
    this.api.list(this.page, this.limit, this.q).subscribe({
      next: res => {
        this.items = res.items ?? [];
        this.total = res.total ?? 0;
        this.loading = false;
      },
      error: () => { this.items = []; this.total = 0; this.loading = false; }
    });
  }

  add() {
    this.dialog.open(EmployerDialogComponent, { width: '560px', data: null })
      .afterClosed().subscribe(ok => { if (ok) this.load(); });
  }

  edit(row: Employer) {
    this.dialog.open(EmployerDialogComponent, { width: '560px', data: row })
      .afterClosed().subscribe(ok => { if (ok) this.load(); });
  }

  remove(row: Employer) {
    if (!confirm(`Видалити роботодавця «${row.name}»?`)) return;
    this.api.delete(row._id!).subscribe({
      next: () => this.load(),
      error: () => {}
    });
  }
}
