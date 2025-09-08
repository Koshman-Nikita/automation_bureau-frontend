import { Injectable } from '@angular/core';

const ACCESS_KEY = 'ab_access';
const REFRESH_KEY = 'ab_refresh';

@Injectable({ providedIn: 'root' })
export class TokenService {
  get access(): string | null { return localStorage.getItem(ACCESS_KEY); }
  set access(v: string | null) { v ? localStorage.setItem(ACCESS_KEY, v) : localStorage.removeItem(ACCESS_KEY); }

  get refresh(): string | null { return localStorage.getItem(REFRESH_KEY); }
  set refresh(v: string | null) { v ? localStorage.setItem(REFRESH_KEY, v) : localStorage.removeItem(REFRESH_KEY); }

  clear() { localStorage.removeItem(ACCESS_KEY); localStorage.removeItem(REFRESH_KEY); }
}
