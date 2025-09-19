import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { UserSignup } from '../interfaces/UserSignup';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http:HttpClient, private router: Router){

  }


  getMessage():Observable<string>{
    const url = '/api/home';
    return this.http.get<string>(url);
  }

  saveUser(user:UserSignup):Observable<string>{
    const url = '/api/auth/signup'
    return this.http.post<string>(url,user);
  }

  login(credentials: { email: string, password: string }): Observable<{ accessToken: string, refreshToken: string }>{
    const url = '/api/auth/login';
    return this.http.post<{ accessToken: string, refreshToken: string }>(url, credentials).pipe(
      tap(tokens => this.setTokens(tokens))
    );
  }

  refreshToken(): Observable<{ accessToken: string }>{
    const url = '/api/auth/refresh-token';
    const refreshToken = this.getRefreshToken();
    return this.http.post<{ accessToken: string }>(url, { refreshToken }).pipe(
      tap(token => {
        if (token?.accessToken) {
          const existingRefresh = this.getRefreshToken();
          this.setTokens({ accessToken: token.accessToken, refreshToken: existingRefresh ?? '' });
        }
      })
    );
  }

  logout(): Observable<string> {
    const url = '/api/auth/logout';
    return this.http.post<string>(url, {}, { responseType: 'text' as 'json' }).pipe(
      tap(() => {
        this.clearTokens();
        this.router.navigate(['/login']);
      })
    );
  }

  setTokens(tokens: { accessToken: string, refreshToken: string }): void {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  getAccessToken(): string | null { return localStorage.getItem('accessToken'); }
  getRefreshToken(): string | null { return localStorage.getItem('refreshToken'); }
}
