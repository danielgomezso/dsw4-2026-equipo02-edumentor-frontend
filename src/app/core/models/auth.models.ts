import { HttpErrorResponse } from '@angular/common/http';

export const API_URL = 'http://localhost:8080/api/v1';

export type Rol = 'ESTUDIANTE' | 'TUTOR' | 'COORDINADOR';
export type RegisterableRole = 'ESTUDIANTE' | 'TUTOR';

export interface Usuario {
  id: number;
  carne: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: Rol;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  carne: string;
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: RegisterableRole;
}

export interface AuthResponse {
  token: string;
  user: Usuario;
}

export interface ProblemDetail {
  title?: string;
  status?: number;
  detail?: string;
}

export const ROLE_ROUTES: Record<Rol, string> = {
  ESTUDIANTE: '/estudiante',
  TUTOR: '/tutor',
  COORDINADOR: '/coordinador',
};

export const ROLE_PERMISSIONS: Record<Rol, string[]> = {
  ESTUDIANTE: ['Explorar tutorías', 'Mis reservas'],
  TUTOR: ['Mis ofertas', 'Mi horario'],
  COORDINADOR: ['Usuarios', 'Materias y sesiones'],
};

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor (http://localhost:8080).';
    }
    const problem = error.error as ProblemDetail | null;
    if (problem?.detail) {
      return problem.detail;
    }
  }
  return fallback;
}
