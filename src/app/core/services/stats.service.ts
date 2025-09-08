import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StatsOverview {
  vacanciesOpen: number;
  vacanciesClosed: number;
  jobseekersSearching: number;
  jobseekersEmployed: number;
  agreements7d: number;
  agreements30d: number;
  recent: Array<{
    _id: string;
    date: string;
    employerName?: string | null;
    vacancyTitle?: string | null;
    jobseekerName?: string | null;
  }>;
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private http = inject(HttpClient);
  private baseUrl = '/api/stats';

  overview(q = ''): Observable<StatsOverview> {
    let params = new HttpParams();
    if (q?.trim()) params = params.set('q', q.trim());
    return this.http.get<StatsOverview>(`${this.baseUrl}/overview`, { params });
  }
}
