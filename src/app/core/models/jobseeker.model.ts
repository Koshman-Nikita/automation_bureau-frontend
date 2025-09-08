// src/app/core/models/jobseeker.model.ts
export interface Jobseeker {
  _id?: string;
  fullName: string;
  qualifications: string[];
  activityType: string | null;
  city?: string | null;
  salaryDesired?: number | null;
  status: 'searching' | 'employed';
  createdAt?: string;
  updatedAt?: string;
}
