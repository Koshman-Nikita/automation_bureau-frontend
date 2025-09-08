import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';


export const canActivateAuth: CanActivateFn = (): any => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const goLogin: UrlTree = router.createUrlTree(['/login']);

  if (auth.isAuthenticated) {
    return auth.me().pipe(
      map(() => true),
      catchError(() => of(goLogin))
    );
  }

  return auth.refresh().pipe(
    switchMap(ok => ok ? auth.me().pipe(map(() => true)) : of(goLogin)),
    catchError(() => of(goLogin))
  );
};


export const canActivateGuest: CanActivateFn = (): any => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated) {
    return of(router.createUrlTree(['/dashboard']));
  }
  return of(true);
};


export function hasRole(...roles: Array<'admin'|'manager'|'employer'|'jobseeker'>): CanActivateFn {
  return (): any => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const deny = of(router.createUrlTree(['/login']));

    const check = () => {
      const user = auth.currentUser;
      if (user && roles.includes(user.role)) return of(true);
      return deny;
    };

    if (auth.currentUser) return check();

    return auth.me().pipe(
      switchMap(() => check()),
      catchError(() => deny)
    );
  };
}
