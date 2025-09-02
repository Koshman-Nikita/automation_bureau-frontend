import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paged } from '../models/paged.model';
import { environment } from '../../../environments/environment';

export class CrudService<T> {
  protected http = inject(HttpClient);
  constructor(private resource: string) {}

  private url(path = ''): string {
    const base = environment.apiBase.replace(/\/$/, '');
    const res = this.resource.replace(/^\//, '');
    const p = path ? `/${path.replace(/^\//, '')}` : '';
    return `${base}/${res}${p}`;
  }

  list(page = 1, limit = 10, q = ''): Observable<Paged<T>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (q) params = params.set('q', q);
    return this.http.get<Paged<T>>(this.url(), { params });
  }

  get(id: string): Observable<T> {
    return this.http.get<T>(this.url(id));
  }

  create(body: Partial<T>): Observable<T> {
    return this.http.post<T>(this.url(), body);
  }

  update(id: string, body: Partial<T>): Observable<T> {
    return this.http.patch<T>(this.url(id), body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.url(id));
  }
}
