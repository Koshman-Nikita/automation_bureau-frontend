export type Role = 'admin' | 'manager' | 'employer' | 'jobseeker';

export interface AuthUser {
  _id: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user?: AuthUser;
}
