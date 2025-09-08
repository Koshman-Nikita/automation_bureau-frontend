export type VacancyStatus = 'open' | 'closed';

export interface Vacancy {
  _id?: string;
  employerId: string;
  title: string;
  position?: string | null;
  activityType?: string | null;
  skills: string[];
  salary?: number | null;
  status: VacancyStatus;
  createdAt?: string;
  updatedAt?: string;
}
