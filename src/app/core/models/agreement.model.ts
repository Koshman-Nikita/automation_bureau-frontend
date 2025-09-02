export interface Agreement {
  _id?: string;

  employerId: string;
  jobseekerId: string;

  vacancyId?: string;

  position: string;

  commission?: number | null;

  notes?: string | null;
}
