import { Injectable } from '@angular/core';
import { CrudService } from './crud.service';
import { Vacancy } from '../models/vacancy.model';

@Injectable({ providedIn: 'root' })
export class VacanciesService extends CrudService<Vacancy> {
  constructor() { super('/api/vacancies'); }
}
