import { Injectable } from '@angular/core';
import { CrudService } from './crud.service';
import { Employer } from '../models/employer.model';

@Injectable({ providedIn: 'root' })
export class EmployersService extends CrudService<Employer> {
  constructor() { super('/api/employers'); }
}
