export interface Vacancy {
  _id?: string;

  employerId: string;
  title: string;
  activityType: string;

  salaryFrom?: number | null;
  salaryTo?: number | null;

  isActive?: boolean;
  notes?: string | null;
}
