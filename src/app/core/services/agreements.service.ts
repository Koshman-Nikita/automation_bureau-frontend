import { Injectable } from '@angular/core';
import { CrudService } from './crud.service';
import { Agreement } from '../models/agreement.model';

@Injectable({ providedIn: 'root' })
export class AgreementsService extends CrudService<Agreement> {
  constructor() { super('/api/agreements'); }
}
