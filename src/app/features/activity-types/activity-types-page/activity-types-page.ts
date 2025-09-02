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

import { ActivityTypesService } from '../../../core/services/activity-types.service';
import { ActivityType } from '../../../core/models/activity-type.model';
import { ActivityTypeDialogComponent } from '../activity-type-dialog/activity-type-dialog';

@Component({
  standalone: true,
  selector: 'app-activity-types-page',
  templateUrl: './activity-types-page.html',
  styleUrls: ['./activity-types-page.scss'],
  imports: [
    CommonModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, FormsModule
  ]
})
export class ActivityTypesPage {
  private api = inject(ActivityTypesService);
  private dialog = inject(MatDialog);

  cols = ['name', 'isActive', 'actions'];
  items = signal<ActivityType[]>([]);
  total = signal(0);
  page = signal(1);
  limit = signal(10);
  q = '';

  ngOnInit() { this.reload(); }

  reload() {
    this.api.list(this.page(), this.limit(), this.q).subscribe(r => {
      this.items.set(r.items);
      this.total.set(r.total);
    });
  }

  onPage(e: PageEvent) {
    this.page.set((e.pageIndex ?? 0) + 1);
    this.limit.set(e.pageSize ?? 10);
    this.reload();
  }

  openCreate() {
    this.dialog.open(ActivityTypeDialogComponent, { data: null })
      .afterClosed().subscribe(ok => ok && this.reload());
  }

  openEdit(row: ActivityType) {
    this.dialog.open(ActivityTypeDialogComponent, { data: row })
      .afterClosed().subscribe(ok => ok && this.reload());
  }

  remove(row: ActivityType) {
    if (!row._id) return;
    if (!confirm(`Видалити "${row.name}"?`)) return;
    this.api.delete(row._id).subscribe(() => this.reload());
  }
}
