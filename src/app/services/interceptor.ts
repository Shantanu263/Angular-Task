import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  private router = inject(Router);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isAuthEndpoint = req.url.includes('/api/auth/login') || req.url.includes('/api/auth/signup') || req.url.includes('/api/auth/refresh-token') || req.url.includes('/api/auth/logout');
    if (isAuthEndpoint) {
      return next.handle(req);
    }

    const accessToken = this.authService.getAccessToken();
    const authReq = accessToken
      ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } }) 
      : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 403) {
          const refreshToken = this.authService.getRefreshToken();
          if (!refreshToken) {
            this.authService.clearTokens();
            this.router.navigate(['/login']);
            return throwError(() => error);
          }

          return this.authService.refreshToken().pipe(
            switchMap(({ accessToken }) => {
              const retriedReq = req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } });
              return next.handle(retriedReq);
            }),
            catchError(refreshError => {
              this.authService.clearTokens();
              this.router.navigate(['/login']);
              return throwError(() => refreshError);
            })
          );
        }

        return throwError(() => error);
      })
    );
  }
}


