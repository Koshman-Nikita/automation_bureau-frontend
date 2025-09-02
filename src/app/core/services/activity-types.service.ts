import { Injectable, Inject } from '@angular/core';
import { CrudService } from './crud.service';
import { ActivityType } from '../models/activity-type.model';
import { API_BASE } from '../tokens';

@Injectable({ providedIn: 'root' })
export class ActivityTypesService extends CrudService<ActivityType> {
  constructor(@Inject(API_BASE) api: string) {
    super(`${api}/api/activity-types`);
  }
}
