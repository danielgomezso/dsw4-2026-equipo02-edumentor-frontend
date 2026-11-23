import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/auth.guard';
import { hubGuard, hubRoleGuard } from './features/edumentor/identity.service';
export const routes: Routes = [
  { path:'', pathMatch:'full', loadComponent:() => import('./features/edumentor/home.component').then(m => m.HomeComponent) },
  { path:'login', canActivate:[guestGuard], loadComponent:() => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path:'registro', canActivate:[guestGuard], loadComponent:() => import('./features/auth/registro/registro.component').then(m => m.RegistroComponent) },
  ...(['ESTUDIANTE','TUTOR','COORDINADOR'] as const).map(role => ({ path:role.toLowerCase(), canActivate:[hubRoleGuard], data:{roles:[role]}, loadComponent:() => import('./features/edumentor/dashboard.component').then(m => m.DashboardComponent) })),
  { path:'materias', canActivate:[hubGuard], loadComponent:() => import('./features/edumentor/materias.component').then(m => m.MateriasComponent) },
  { path:'tutores', canActivate:[hubGuard], loadComponent:() => import('./features/edumentor/tutores.component').then(m => m.TutoresComponent) },
  { path:'horarios', canActivate:[hubGuard], loadComponent:() => import('./features/edumentor/horarios.component').then(m => m.HorariosComponent) },
  { path:'sesiones', canActivate:[hubGuard], loadComponent:() => import('./features/edumentor/sesiones.component').then(m => m.SesionesComponent) },
  { path:'sesiones/:id', canActivate:[hubGuard], loadComponent:() => import('./features/edumentor/detalle.component').then(m => m.DetalleComponent) },
  { path:'**', redirectTo:'' }
];
