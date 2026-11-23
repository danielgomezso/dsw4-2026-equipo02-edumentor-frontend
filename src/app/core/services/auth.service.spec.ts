import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { API_URL, AuthResponse } from '../models/auth.models';
import { AuthService } from './auth.service';

const mockResponse = (): AuthResponse => ({
  token: 'eyJhbGciOiJIUzI1NiJ9.test',
  user: {
    id: 1,
    carne: 'E00001',
    email: 'estudiante@edumentor.test',
    nombre: 'Sofia',
    apellido: 'Estudiante',
    rol: 'ESTUDIANTE',
  },
});

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('starts unauthenticated when localStorage is empty', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
    expect(service.getToken()).toBeNull();
  });

  it('login stores the session in localStorage and updates signals', () => {
    const expected = mockResponse();
    service.login({ email: 'estudiante@edumentor.test', password: 'Estudiante123!' }).subscribe();

    const req = httpMock.expectOne(`${API_URL}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(expected);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.role()).toBe('ESTUDIANTE');
    expect(service.getToken()).toBe(expected.token);
    expect(service.homeRoute()).toBe('/estudiante');
    expect(localStorage.getItem('edumentor.auth.session')).toContain(expected.token);
  });

  it('logout clears localStorage and navigates to /login', () => {
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    service.login({ email: 'a@b.c', password: 'x' }).subscribe();
    httpMock.expectOne(`${API_URL}/auth/login`).flush(mockResponse());

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('edumentor.auth.session')).toBeNull();
    expect(navSpy).toHaveBeenCalledWith(['/login']);
  });
});
