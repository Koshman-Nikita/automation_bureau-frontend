import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ActivityTypesService } from '../../../core/services/activity-types.service';
import { ActivityType } from '../../../core/models/activity-type.model';
import { ActivityTypeDialogComponent } from '../activity-type-dialog/activity-type-dialog';

@Component({
  selector: 'app-activity-types-page',
  standalone: true,
  templateUrl: './activity-types-page.html',
  styleUrls: ['./activity-types-page.scss'],
  imports: [
    CommonModule,
    FormsModule,

    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
})
export class ActivityTypesPage implements OnInit {

  cols: string[] = ['name', 'actions'];
  items: ActivityType[] = [];

  page = 1;
  limit = 10;
  total = 0;
  q = '';

  loading = false;

  constructor(
    private api: ActivityTypesService,
    private dialog: MatDialog,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  back() {
    this.location.back();
  }

  load() {
    this.loading = true;
    this.api.list(this.page, this.limit, this.q).subscribe({
      next: (res) => {
        this.items = res.items ?? [];
        this.total = res.total ?? 0;
        this.loading = false;
      },
      error: () => {
        this.items = [];
        this.total = 0;
        this.loading = false;
      }
    });
  }

  search() {
    this.page = 1;
    this.load();
  }

  pageChange(ev: PageEvent) {
    this.page  = (ev.pageIndex ?? 0) + 1;
    this.limit = ev.pageSize ?? this.limit;
    this.load();
  }

  add() {
    const ref = this.dialog.open(ActivityTypeDialogComponent, {
      width: '420px',
      data: null,
      disableClose: true,
    });

    ref.afterClosed().subscribe(ok => ok && this.load());
  }

  edit(row: ActivityType) {
    const ref = this.dialog.open(ActivityTypeDialogComponent, {
      width: '420px',
      data: row,
      disableClose: true,
    });

    ref.afterClosed().subscribe(ok => ok && this.load());
  }

  remove(row: ActivityType) {
    if (!row?._id) return;
    const sure = confirm(`Видалити вид діяльності «${row.name}»?`);
    if (!sure) return;

    this.api.delete(row._id).subscribe({
      next: () => this.load(),
      error: () => {}
    });
  }
}
