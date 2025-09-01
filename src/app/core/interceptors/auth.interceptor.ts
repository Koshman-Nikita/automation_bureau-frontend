import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, firstValueFrom, switchMap, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokens = inject(TokenService);
  const auth = inject(AuthService);
  const snack = inject(MatSnackBar);

  const access = tokens.access;
  const authReq = access ? req.clone({ setHeaders: { Authorization: `Bearer ${access}` } }) : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && tokens.refresh) {
        // спробувати оновити токен і повторити запит
        return auth.refresh().pipe(
          switchMap(async ok => {
            if (!ok) {
              snack.open('Сесія завершена. Увійдіть знову.', 'OK', { duration: 3000 });
              throw err;
            }
            const retried = authReq.clone({ setHeaders: { Authorization: `Bearer ${tokens.access}` } });
            return await firstValueFrom(next(retried));
          })
        );
      }

      // Загальна помилка
      const msg = (err.error && (err.error.error || err.error.message)) || `Помилка ${err.status}`;
      snack.open(msg, 'OK', { duration: 3000 });
      return throwError(() => err);
    })
  );
};
