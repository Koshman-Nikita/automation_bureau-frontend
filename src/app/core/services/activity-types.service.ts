import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrudService, Page } from './crud.service';
import { Observable, tap } from 'rxjs';
import { ActivityType } from '../models/activity-type.model';

@Injectable({ providedIn: 'root' })
export class ActivityTypesService extends CrudService<ActivityType> {
  constructor(protected override http: HttpClient) {
    super('/api/activity-types');
  }

  override list(page = 1, limit = 20, q = ''): Observable<Page<ActivityType>> {
    const params: any = { page, limit };
    if (q?.trim()) params.q = q.trim();
    console.log('[ActivityTypesService] list() params:', params);

    return this.http.get<Page<ActivityType>>(this.baseUrl, { params }).pipe(
      tap(res => console.log('[ActivityTypesService] API response:', res))
    );
  }
}


