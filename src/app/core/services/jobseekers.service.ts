import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { CrudService, Page } from './crud.service';
import { Jobseeker } from '../models/jobseeker.model';

@Injectable({ providedIn: 'root' })
export class JobseekersService extends CrudService<Jobseeker> {
  constructor(protected override http: HttpClient) {
    super('/api/jobseekers');
  }

  override list(page = 1, limit = 10, q = '', status?: Jobseeker['status']): Observable<Page<Jobseeker>> {
    const params: any = { page, limit };
    if (q?.trim()) params.q = q.trim();
    if (status) params.status = status;
    console.log('[JobseekersService] list() params:', params);

    return this.http.get<Page<Jobseeker>>(this.baseUrl, { params }).pipe(
      tap(res => console.log('[JobseekersService] API response:', res))
    );
  }

  override get(id: string): Observable<Jobseeker> {
    console.log('[JobseekersService] getById()', id);
    return this.http.get<{ item: Jobseeker }>(`${this.baseUrl}/${id}`).pipe(
      map(res => res.item),
      tap({
        next: item => console.log('[JobseekersService] getById() OK:', id, item),
        error: err => console.log('[JobseekersService] getById() ERROR:', err),
      })
    );
  }

  override create(body: Partial<Jobseeker>) {
    console.log('[JobseekersService] create() payload:', body);
    return this.http.post<{ item: Jobseeker }>(this.baseUrl, body).pipe(
      tap({
        next: (res) => console.log('[JobseekersService] create() response:', res),
        error: (err) => console.log('[JobseekersService] create() ERROR:', err)
      }),
      map(res => res.item)
    );
  }

  override update(id: string, body: Partial<Jobseeker>) {
    console.log('[JobseekersService] update() id:', id, 'payload:', body);
    return this.http.patch<{ item: Jobseeker }>(`${this.baseUrl}/${id}`, body).pipe(
      tap({
        next: (res) => console.log('[JobseekersService] update() response:', res),
        error: (err) => console.log('[JobseekersService] update() ERROR:', err)
      }),
      map(res => res.item)
    );
  }

}
