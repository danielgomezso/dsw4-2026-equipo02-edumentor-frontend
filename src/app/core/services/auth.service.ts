import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import {
  API_URL,
  AuthResponse,
  LoginRequest,
  ROLE_ROUTES,
  RegisterRequest,
  Rol,
  Usuario,
} from '../models/auth.models';

const STORAGE_KEY = 'edumentor.auth.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly session = signal<AuthResponse | null>(this.loadSession());

  readonly user = computed<Usuario | null>(() => this.session()?.user ?? null);
  readonly role = computed<Rol | null>(() => this.user()?.rol ?? null);
  readonly isAuthenticated = computed<boolean>(() => Boolean(this.session()?.token));

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/login`, credentials)
      .pipe(tap((res) => this.saveSession(res)));
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/register`, payload)
      .pipe(tap((res) => this.saveSession(res)));
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.session.set(null);
    void this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.session()?.token ?? null;
  }

  hasRole(...roles: Rol[]): boolean {
    const current = this.role();
    return current !== null && roles.includes(current);
  }

  homeRoute(): string {
    const current = this.role();
    return current ? ROLE_ROUTES[current] : '/login';
  }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
    this.session.set(res);
  }

  private loadSession(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AuthResponse;
      return parsed?.token && parsed?.user?.rol ? parsed : null;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }
}
