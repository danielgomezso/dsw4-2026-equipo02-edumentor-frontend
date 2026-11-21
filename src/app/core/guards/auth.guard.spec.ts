import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { Rol } from '../models/auth.models';
import { AuthService } from '../services/auth.service';
import { authGuard, guestGuard, roleGuard } from './auth.guard';

describe('auth guards', () => {
  let router: Router;
  let state = { authenticated: false, role: null as Rol | null };

  const authStub = {
    isAuthenticated: () => state.authenticated,
    hasRole: (...roles: Rol[]) => state.role !== null && roles.includes(state.role),
    homeRoute: () => (state.role ? `/${state.role.toLowerCase()}` : '/login'),
  };

  beforeEach(() => {
    state = { authenticated: false, role: null };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: authStub }],
    });
    router = TestBed.inject(Router);
  });

  const runGuard = (guard: typeof authGuard, roles?: Rol[]) => {
    const route = { data: roles ? { roles } : {} } as unknown as ActivatedRouteSnapshot;
    const routerState = { url: '/tutor' } as RouterStateSnapshot;
    return TestBed.runInInjectionContext(() => guard(route, routerState));
  };

  it('authGuard redirects unauthenticated users to /login', () => {
    const result = runGuard(authGuard);
    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });

  it('roleGuard allows users with matching role and redirects others to their homeRoute', () => {
    state = { authenticated: true, role: 'ESTUDIANTE' };
    const denied = runGuard(roleGuard, ['TUTOR']);
    expect(router.serializeUrl(denied as UrlTree)).toBe('/estudiante');

    state = { authenticated: true, role: 'TUTOR' };
    expect(runGuard(roleGuard, ['TUTOR'])).toBe(true);
  });

  it('guestGuard redirects authenticated users to their homeRoute', () => {
    state = { authenticated: true, role: 'COORDINADOR' };
    const result = runGuard(guestGuard);
    expect(router.serializeUrl(result as UrlTree)).toBe('/coordinador');
  });
});
