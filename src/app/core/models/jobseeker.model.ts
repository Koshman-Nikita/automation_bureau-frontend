export interface Jobseeker {
  _id: string;

  lastName: string;
  firstName: string;
  middleName?: string | null;

  qualification: string;
  activityType: string;

  desiredSalary?: number | null;

  notes?: string | null;
  isActive?: boolean;
}
