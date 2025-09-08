import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrudService, Page } from './crud.service';
import { Agreement } from '../models/agreement.model';
import { Observable, tap, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AgreementsService extends CrudService<Agreement> {
  constructor(protected override http: HttpClient) {
    super('/api/agreements');
  }

  override list(page = 1, limit = 10, q = ''): Observable<Page<Agreement>> {
    const params: any = { page, limit };
    if (q?.trim()) params.q = q.trim();
    console.log('[AgreementsService] list() params:', params);

    return this.http.get<Page<Agreement>>(this.baseUrl, { params }).pipe(
      tap(res => console.log('[AgreementsService] API response:', res))
    );
  }

  override get(id: string): Observable<Agreement> {
    return this.http.get<{ item: Agreement }>(`${this.baseUrl}/${id}`).pipe(
      map(res => res.item)
    );
  }

  override create(body: Partial<Agreement>): Observable<Agreement> {
    console.log('[AgreementsService] create() payload:', body);
    return this.http.post<{ item: Agreement }>(this.baseUrl, body).pipe(
      map(res => res.item),
      tap({
        next: item => console.log('[AgreementsService] create() OK:', item),
        error: err => console.log('[AgreementsService] create() ERROR:', err),
      })
    );
  }

  override update(id: string, body: Partial<Agreement>): Observable<Agreement> {
    console.log('[AgreementsService] update() id:', id, 'payload:', body);
    return this.http.patch<{ item: Agreement }>(`${this.baseUrl}/${id}`, body).pipe(
      map(res => res.item),
      tap({
        next: item => console.log('[AgreementsService] update() OK:', item),
        error: err => console.log('[AgreementsService] update() ERROR:', err),
      })
    );
  }
}
