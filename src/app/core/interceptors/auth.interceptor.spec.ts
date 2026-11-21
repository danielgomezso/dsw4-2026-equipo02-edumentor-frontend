import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_URL } from '../models/auth.models';
import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authStub: { getToken: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authStub = { getToken: vi.fn(), logout: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authStub },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('attaches Bearer token to protected API requests', () => {
    authStub.getToken.mockReturnValue('mi-jwt');
    http.get(`${API_URL}/usuarios/me`).subscribe();

    const req = httpMock.expectOne(`${API_URL}/usuarios/me`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer mi-jwt');
    req.flush({});
  });

  it('does not attach token to public auth endpoints', () => {
    authStub.getToken.mockReturnValue('mi-jwt');
    http.post(`${API_URL}/auth/login`, {}).subscribe();

    const req = httpMock.expectOne(`${API_URL}/auth/login`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('calls logout when a protected endpoint responds 401', () => {
    authStub.getToken.mockReturnValue('expirado');
    http.get(`${API_URL}/usuarios/me`).subscribe({ error: () => undefined });

    const req = httpMock.expectOne(`${API_URL}/usuarios/me`);
    req.flush({ detail: 'Expirado' }, { status: 401, statusText: 'Unauthorized' });

    expect(authStub.logout).toHaveBeenCalled();
  });
});
