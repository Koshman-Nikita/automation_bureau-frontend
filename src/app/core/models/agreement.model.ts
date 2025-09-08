export interface Agreement {
  _id?: string;
  employerId: string;
  jobseekerId: string;
  vacancyId?: string | null;
  position: string;
  commission?: number | null;
  createdAt?: string;
  updatedAt?: string;
}
