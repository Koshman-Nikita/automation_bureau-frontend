import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { AuthUser, LoginResponse } from '../models/auth.models';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private tokens = inject(TokenService);
  private readonly api = 'http://localhost:4000/api/auth';

  private user$ = new BehaviorSubject<AuthUser | null>(null);
  readonly currentUser$ = this.user$.asObservable();

  get isAuthenticated(): boolean { return !!this.tokens.access; }
  get currentUser(): AuthUser | null { return this.user$.value; }

  login(email: string, password: string): Observable<AuthUser> {
    return this.http.post<LoginResponse>(`${this.api}/login`, { email, password }).pipe(
      tap(r => { this.tokens.access = r.accessToken; this.tokens.refresh = r.refreshToken; }),
      switchMap(() => this.me())
    );
  }

  register(email: string, password: string, role: string): Observable<AuthUser> {
    return this.http.post<LoginResponse>(`${this.api}/register`, { email, password, role }).pipe(
      tap(r => { this.tokens.access = r.accessToken; }),
      switchMap(() => this.me())
    );
  }

  me(): Observable<AuthUser> {
    return this.http.get<{ user: AuthUser }>(`${this.api}/me`).pipe(
      map(r => r.user),
      tap(u => this.user$.next(u))
    );
  }

  refresh(): Observable<boolean> {
    const rt = this.tokens.refresh;
    if (!rt) return of(false);
    return this.http.post<LoginResponse>(`${this.api}/refresh`, { refreshToken: rt }).pipe(
      tap(r => { this.tokens.access = r.accessToken; this.tokens.refresh = r.refreshToken; }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  logout() { this.tokens.clear(); this.user$.next(null); }
}
