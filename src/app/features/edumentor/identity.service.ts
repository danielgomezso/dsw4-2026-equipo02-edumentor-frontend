import { Injectable, computed, inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Rol, ROLE_ROUTES } from '../../core/models/auth.models';
import { authGuard, roleGuard } from '../../core/guards/auth.guard';
import { DEMO_MODE } from './config';
@Injectable({ providedIn: 'root' })
export class IdentityService {
  readonly auth = inject(AuthService);
  readonly demo = DEMO_MODE;
  private readonly demoRole = signal<Rol>(this.readRole());
  readonly role = computed(() => (this.demo ? this.demoRole() : this.auth.role()));
  readonly user = computed(() =>
    this.demo
      ? {
          id: this.role() === 'TUTOR' ? 2 : this.role() === 'COORDINADOR' ? 3 : 1,
          nombre: 'Konny',
          apellido: 'Demo',
        }
      : this.auth.user(),
  );
  home(): string {
    const role = this.role();
    return role ? ROLE_ROUTES[role] : '/';
  }
  switchRole(role: string): void {
    if (!this.demo || !['ESTUDIANTE', 'TUTOR', 'COORDINADOR'].includes(role)) return;
    sessionStorage.setItem('edumentor.demo.role', role);
    location.assign(ROLE_ROUTES[role as Rol]);
  }
  private readRole(): Rol {
    const role = sessionStorage.getItem('edumentor.demo.role');
    return role === 'TUTOR' || role === 'COORDINADOR' ? role : 'ESTUDIANTE';
  }
}
export const hubGuard: CanActivateFn = (route, state) =>
  DEMO_MODE ? true : authGuard(route, state);
export const hubRoleGuard: CanActivateFn = (route, state) => {
  if (!DEMO_MODE) return roleGuard(route, state);
  const identity = inject(IdentityService);
  return (
    (route.data['roles'] as Rol[]).includes(identity.role()!) ||
    inject(Router).createUrlTree([identity.home()])
  );
};
