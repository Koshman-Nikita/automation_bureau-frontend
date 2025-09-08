import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export class CrudService<T> {
  protected http = inject(HttpClient);

  constructor(protected baseUrl: string) {}

  list(page = 1, limit = 10, q = ''): Observable<Page<T>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (q) params = params.set('q', q);
    return this.http.get<Page<T>>(this.baseUrl, { params });
  }

  get(id: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${id}`);
  }

  create(body: Partial<T>): Observable<T> {
    return this.http.post<T>(this.baseUrl, body);
  }

  update(id: string, body: Partial<T>): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
