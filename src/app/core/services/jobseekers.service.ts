import { Injectable } from '@angular/core';
import { CrudService } from './crud.service';
import { Jobseeker } from '../models/jobseeker.model';

@Injectable({ providedIn: 'root' })
export class JobseekersService extends CrudService<Jobseeker> {
  constructor() { super('/api/jobseekers'); }
}
