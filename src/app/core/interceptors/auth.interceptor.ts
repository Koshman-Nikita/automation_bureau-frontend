import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const tokens = inject(TokenService);

  const isAbsolute = /^https?:\/\//i.test(req.url);
  const base = environment.apiBase?.replace(/\/+$/, '') ?? '';
  const url = isAbsolute
    ? req.url
    : `${base}${req.url.startsWith('/') ? '' : '/'}${req.url}`;

  const headers = tokens.access
    ? req.headers.set('Authorization', `Bearer ${tokens.access}`)
    : req.headers;

  const cloned = req.clone({ url, headers });
  return next(cloned);
};
