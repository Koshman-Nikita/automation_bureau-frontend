// src/app/core/services/employers.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrudService, Page } from './crud.service';
import { Observable, tap, map } from 'rxjs';
import { Employer } from '../models/employer.model';

@Injectable({ providedIn: 'root' })
export class EmployersService extends CrudService<Employer> {
  constructor(protected override http: HttpClient) {
    super('/api/employers');
  }

  override list(page = 1, limit = 20, q = '', city?: string): Observable<Page<Employer>> {
    const params: any = { page, limit };
    if (q?.trim()) params.q = q.trim();
    if (city?.trim()) params.city = city.trim();

    console.log('[EmployersService] list() params:', params);
    return this.http.get<Page<Employer>>(this.baseUrl, { params }).pipe(
      tap(res => console.log('[EmployersService] API response:', res))
    );
  }

  override get(id: string): Observable<Employer> {
    console.log('[EmployersService] get()', id);
    return this.http.get<{ item: Employer }>(`${this.baseUrl}/${id}`).pipe(
      map(res => res.item),
      tap({
        next: item => console.log('[EmployersService] get() OK:', id, item),
        error: err => console.log('[EmployersService] get() ERROR:', err),
      })
    );
  }

  getById(id: string): Observable<Employer> {
    return this.get(id);
  }

  override create(body: Partial<Employer>): Observable<Employer> {
    console.log('[EmployersService] create() payload:', body);
    return this.http.post<{ item: Employer }>(this.baseUrl, body).pipe(
      map(res => res.item),
      tap({
        next: item => console.log('[EmployersService] create() OK:', item),
        error: err => console.log('[EmployersService] create() ERROR:', err),
      })
    );
  }

  override update(id: string, body: Partial<Employer>): Observable<Employer> {
    console.log('[EmployersService] update() id:', id, 'payload:', body);
    return this.http.patch<{ item: Employer }>(`${this.baseUrl}/${id}`, body).pipe(
      map(res => res.item),
      tap({
        next: item => console.log('[EmployersService] update() OK:', item),
        error: err => console.log('[EmployersService] update() ERROR:', err),
      })
    );
  }
}
