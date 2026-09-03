import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto, LoginRequest, RegisterRequest } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  // login
  login(request: LoginRequest): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.apiUrl}/login`, request);
  }

  // 2. REGISTER
  register(request: RegisterRequest): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.apiUrl}/register`, request);
  }

  // /me
  getMe(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.apiUrl}/me`);
  }

  
  refresh(): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.apiUrl}/refresh`, {});
  }

  // logout
  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {});
  }

  // get anti-forgery token
  getAntiforgeryToken(): Observable<void> {
    return this.http.get<void>(`${this.apiUrl}/antiforgery-token`);
  }
}