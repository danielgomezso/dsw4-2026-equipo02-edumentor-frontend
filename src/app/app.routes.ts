import { Routes } from '@angular/router';
import { guestGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    title: 'Iniciar sesión · EduMentor Hub',
  },
  {
    path: 'registro',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/registro/registro.component').then((m) => m.RegistroComponent),
    title: 'Crear cuenta · EduMentor Hub',
  },
  {
    path: 'estudiante',
    canActivate: [roleGuard],
    data: { roles: ['ESTUDIANTE'] },
    loadComponent: () =>
      import('./features/panel/panel.component').then((m) => m.PanelComponent),
    title: 'Panel Estudiante · EduMentor Hub',
  },
  {
    path: 'tutor',
    canActivate: [roleGuard],
    data: { roles: ['TUTOR'] },
    loadComponent: () =>
      import('./features/panel/panel.component').then((m) => m.PanelComponent),
    title: 'Panel Tutor · EduMentor Hub',
  },
  {
    path: 'coordinador',
    canActivate: [roleGuard],
    data: { roles: ['COORDINADOR'] },
    loadComponent: () =>
      import('./features/panel/panel.component').then((m) => m.PanelComponent),
    title: 'Panel Coordinador · EduMentor Hub',
  },
  { path: '**', redirectTo: 'login' },
];
