import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { StatsService, StatsOverview } from '../../core/services/stats.service';

@Component({
  standalone: true,
  selector: 'app-dashboard-page',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule
  ]
})
export class DashboardPageComponent {
  private statsApi = inject(StatsService);
  private router = inject(Router);

  // пошук
  q = signal<string>('');

  // завантаження
  loading = signal<boolean>(false);

  // дані
  counts = signal<StatsOverview>({
    vacanciesOpen: 0,
    vacanciesClosed: 0,
    jobseekersSearching: 0,
    jobseekersEmployed: 0,
    agreements7d: 0,
    agreements30d: 0,
    recent: []
  });

  recent = computed(() => this.counts().recent ?? []);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.statsApi.overview(this.q()).subscribe({
      next: res => this.counts.set({
        vacanciesOpen: res?.vacanciesOpen ?? 0,
        vacanciesClosed: res?.vacanciesClosed ?? 0,
        jobseekersSearching: res?.jobseekersSearching ?? 0,
        jobseekersEmployed: res?.jobseekersEmployed ?? 0,
        agreements7d: res?.agreements7d ?? 0,
        agreements30d: res?.agreements30d ?? 0,
        recent: Array.isArray(res?.recent) ? res.recent : []
      }),
      error: () => this.counts.set({
        vacanciesOpen: 0, vacanciesClosed: 0,
        jobseekersSearching: 0, jobseekersEmployed: 0,
        agreements7d: 0, agreements30d: 0, recent: []
      }),
      complete: () => this.loading.set(false)
    });
  }

  doSearch() { this.load(); }

  // показуємо число (0 замість прочерка)
  val(n?: number | null): number { return Number.isFinite(n as number) ? (n as number) : 0; }

  fmtDate(s?: string) {
    if (!s) return '—';
    const d = new Date(s);
    return isNaN(d.getTime()) ? '—' :
      d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  // кнопки швидких дій
  goCreate(kind: 'vacancy'|'agreement'|'jobseeker'|'employer'|'activity') {
    switch (kind) {
      case 'vacancy':   this.router.navigate(['/vacancies']); break;
      case 'agreement': this.router.navigate(['/agreements']); break;
      case 'jobseeker': this.router.navigate(['/jobseekers']); break;
      case 'employer':  this.router.navigate(['/employers']); break;
      case 'activity':  this.router.navigate(['/activity-types']); break;
    }
  }

  // рольову перевірку тут залишимо просто true (якщо є реальна role — підставиш)
  isAdmin() { return true; }
}
