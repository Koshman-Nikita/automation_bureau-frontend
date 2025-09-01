import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, of, switchMap } from 'rxjs';

export const canActivateAuth: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated) {
    return auth.me().pipe(
      map(() => true),
      switchMap(() => of(true)),
    );
  } else {
    return auth.refresh().pipe(
      switchMap(ok => ok ? auth.me().pipe(map(() => true)) : of(router.createUrlTree(['/login'])))
    );
  }
};
