import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrudService, Page } from './crud.service';
import { Vacancy } from '../models/vacancy.model';
import { Observable, tap, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VacanciesService extends CrudService<Vacancy> {
  constructor(protected override http: HttpClient) {
    super('/api/vacancies');
  }

  override list(page = 1, limit = 10, q = ''): Observable<Page<Vacancy>> {
    const params: any = { page, limit };
    if (q?.trim()) params.q = q.trim();
    console.log('[VacanciesService] list() params:', params);

    return this.http.get<Page<Vacancy>>(this.baseUrl, { params }).pipe(
      tap(res => console.log('[VacanciesService] API response:', res))
    );
  }

  override get(id: string): Observable<Vacancy> {
    return this.http.get<{ item: Vacancy }>(`${this.baseUrl}/${id}`).pipe(
      map(res => res.item)
    );
  }

  override create(body: Partial<Vacancy>): Observable<Vacancy> {
    console.log('[VacanciesService] create() payload:', body);
    return this.http.post<{ item: Vacancy }>(this.baseUrl, body).pipe(
      map(res => res.item),
      tap({
        next: item => console.log('[VacanciesService] create() OK:', item),
        error: err => console.log('[VacanciesService] create() ERROR:', err),
      })
    );
  }

  override update(id: string, body: Partial<Vacancy>): Observable<Vacancy> {
    console.log('[VacanciesService] update() id:', id, 'payload:', body);
    return this.http.patch<{ item: Vacancy }>(`${this.baseUrl}/${id}`, body).pipe(
      map(res => res.item),
      tap({
        next: item => console.log('[VacanciesService] update() OK:', item),
        error: err => console.log('[VacanciesService] update() ERROR:', err),
      })
    );
  }
}
