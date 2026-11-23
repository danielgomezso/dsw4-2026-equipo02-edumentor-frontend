import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, defer, delay, of } from 'rxjs';
import { API_URL } from '../../core/models/auth.models';
import { I18nService } from '../../i18n/i18n.service';
import { IdentityService } from './identity.service';
import {
  Disponibilidad,
  Evaluacion,
  Materia,
  NuevaDisponibilidad,
  NuevaEvaluacion,
  NuevaSesion,
  NuevoRecurso,
  Recurso,
  Sesion,
  Tutor,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly identity = inject(IdentityService);
  private readonly i18n = inject(I18nService);
  private id = 100;
  private materias: Materia[] = [
    {
      id: 1,
      codigoMateria: 'IF0009',
      nombreMateria: 'Desarrollo de Software IV',
      carrera: 'Informática Empresarial',
      creditos: 4,
    },
    {
      id: 2,
      codigoMateria: 'MA0001',
      nombreMateria: 'Matemática general',
      carrera: 'Formación general',
      creditos: 3,
    },
    {
      id: 3,
      codigoMateria: 'IF0006',
      nombreMateria: 'Bases de datos',
      carrera: 'Informática Empresarial',
      creditos: 4,
    },
  ];
  private tutores: Tutor[] = [
    { id: 2, nombre: 'Lucía', apellido: 'Mora' },
    { id: 4, nombre: 'Andrés', apellido: 'Solano' },
  ];
  private horarios: Disponibilidad[] = [2, 4].flatMap((tutorId) =>
    Array.from({ length: 7 }, (_, index) => ({
      id: tutorId * 10 + index,
      tutorId,
      diaSemana: index + 1,
      horaInicio: '08:00',
      horaFin: '20:00',
      estaActivo: true,
    })),
  );
  private sesiones: Sesion[] = [
    {
      id: 1,
      estudianteId: 1,
      tutorId: 2,
      materiaId: 1,
      fechaHora: new Date(Date.now() - 86400000).toISOString(),
      duracionMinutos: 60,
      estado: 'COMPLETED',
      modalidad: 'VIRTUAL',
      resumen: 'Formularios reactivos y validaciones',
    },
  ];
  private recursos: Recurso[] = [];
  private evaluaciones: Evaluacion[] = [];
  private run<T>(method: string, path: string, body: unknown, local: () => T): Observable<T> {
    return this.identity.demo
      ? defer(() => of(structuredClone(local()))).pipe(delay(180))
      : this.http.request<T>(method, API_URL + path, { body });
  }
  private fail(status = 409): never {
    throw new HttpErrorResponse({ status, error: { title: 'Conflict', status } });
  }
  private session(id: number): Sesion {
    const session = this.sesiones.find((s) => s.id === id);
    if (!session) this.fail(404);
    return session;
  }
  private allowed(session: Sesion): boolean {
    const user = this.identity.user()!;
    return (
      this.identity.role() === 'COORDINADOR' ||
      session.estudianteId === user.id ||
      session.tutorId === user.id
    );
  }
  listMaterias(): Observable<Materia[]> {
    return this.run('GET', '/materias', null, () => this.materias);
  }
  saveMateria(body: Omit<Materia, 'id'>, id?: number): Observable<Materia> {
    return this.run(id ? 'PUT' : 'POST', '/materias' + (id ? '/' + id : ''), body, () => {
      if (this.identity.role() !== 'COORDINADOR') this.fail(403);
      if (
        this.materias.some(
          (m) => m.codigoMateria.toLowerCase() === body.codigoMateria.toLowerCase() && m.id !== id,
        )
      )
        this.fail();
      const item = { ...body, id: id ?? ++this.id };
      this.materias = id
        ? this.materias.map((m) => (m.id === id ? item : m))
        : [...this.materias, item];
      return item;
    });
  }
  deleteMateria(id: number): Observable<void> {
    return this.run('DELETE', '/materias/' + id, null, () => {
      if (this.identity.role() !== 'COORDINADOR') this.fail(403);
      if (this.sesiones.some((s) => s.materiaId === id)) this.fail();
      this.materias = this.materias.filter((m) => m.id !== id);
    });
  }
  listTutores(): Observable<Tutor[]> {
    return this.run('GET', '/usuarios/tutores', null, () => this.tutores);
  }
  listHorarios(tutorId?: number): Observable<Disponibilidad[]> {
    return this.run('GET', '/disponibilidades' + (tutorId ? '?tutorId=' + tutorId : ''), null, () =>
      this.horarios.filter((h) => !tutorId || h.tutorId === tutorId),
    );
  }
  saveHorario(body: NuevaDisponibilidad, id?: number): Observable<Disponibilidad> {
    return this.run(id ? 'PUT' : 'POST', '/disponibilidades' + (id ? '/' + id : ''), body, () => {
      if (this.identity.role() !== 'TUTOR') this.fail(403);
      const tutorId = this.identity.user()!.id;
      if (id && !this.horarios.some((h) => h.id === id && h.tutorId === tutorId)) this.fail(403);
      if (
        body.horaFin <= body.horaInicio ||
        (body.estaActivo &&
          this.horarios.some(
            (h) =>
              h.id !== id &&
              h.tutorId === tutorId &&
              h.estaActivo &&
              h.diaSemana === body.diaSemana &&
              body.horaInicio < h.horaFin &&
              body.horaFin > h.horaInicio,
          ))
      )
        this.fail();
      const item = { ...body, id: id ?? ++this.id, tutorId };
      this.horarios = id
        ? this.horarios.map((h) => (h.id === id ? item : h))
        : [...this.horarios, item];
      return item;
    });
  }
  deleteHorario(id: number): Observable<void> {
    return this.run('DELETE', '/disponibilidades/' + id, null, () => {
      if (
        this.identity.role() !== 'TUTOR' ||
        !this.horarios.some((h) => h.id === id && h.tutorId === this.identity.user()!.id)
      )
        this.fail(403);
      this.horarios = this.horarios.filter((h) => h.id !== id);
    });
  }
  listSesiones(): Observable<Sesion[]> {
    return this.run('GET', '/sesiones', null, () => this.sesiones.filter((s) => this.allowed(s)));
  }
  getSesion(id: number): Observable<Sesion> {
    return this.run('GET', '/sesiones/' + id, null, () => {
      const session = this.session(id);
      if (!this.allowed(session)) this.fail(403);
      return session;
    });
  }
  reserve(body: NuevaSesion): Observable<Sesion> {
    return this.run('POST', '/sesiones', body, () => {
      if (this.identity.role() !== 'ESTUDIANTE') this.fail(403);
      const start = new Date(body.fechaHora).getTime(),
        end = start + body.duracionMinutos * 60000;
      const local = new Date(start - 6 * 3600000),
        day = local.getUTCDay() || 7,
        time = local.toISOString().slice(11, 16);
      const endLocal = new Date(end - 6 * 3600000),
        endTime = endLocal.toISOString().slice(11, 16);
      const student = this.identity.user()!.id;
      if (
        start <= Date.now() ||
        body.tutorId === student ||
        !this.materias.some((m) => m.id === body.materiaId) ||
        !this.tutores.some((t) => t.id === body.tutorId)
      )
        this.fail(400);
      if (
        local.getUTCDate() !== endLocal.getUTCDate() ||
        !this.horarios.some(
          (h) =>
            h.tutorId === body.tutorId &&
            h.estaActivo &&
            h.diaSemana === day &&
            h.horaInicio.slice(0, 5) <= time &&
            h.horaFin.slice(0, 5) >= endTime,
        )
      )
        this.fail();
      if (
        this.sesiones.some(
          (s) =>
            !['CANCELLED', 'REJECTED'].includes(s.estado) &&
            (s.tutorId === body.tutorId || s.estudianteId === student) &&
            start < Date.parse(s.fechaHora) + s.duracionMinutos * 60000 &&
            end > Date.parse(s.fechaHora),
        )
      )
        this.fail();
      const item: Sesion = { ...body, id: ++this.id, estudianteId: student, estado: 'REQUESTED' };
      this.sesiones.push(item);
      return item;
    });
  }
  cancel(id: number): Observable<Sesion> {
    return this.run('PATCH', '/sesiones/' + id + '/cancelacion', {}, () => {
      const session = this.session(id);
      if (!this.allowed(session)) this.fail(403);
      if (!this.canCancel(session)) this.fail();
      session.estado = 'CANCELLED';
      return session;
    });
  }
  canCancel(session: Sesion): boolean {
    return (
      ['REQUESTED', 'CONFIRMED'].includes(session.estado) &&
      Date.parse(session.fechaHora) - Date.now() >= 7200000
    );
  }
  listRecursos(id: number): Observable<Recurso[]> {
    return this.run('GET', '/sesiones/' + id + '/recursos', null, () => {
      if (!this.allowed(this.session(id))) this.fail(403);
      return this.recursos.filter((r) => r.sesionId === id);
    });
  }
  addRecurso(id: number, body: NuevoRecurso): Observable<Recurso> {
    return this.run('POST', '/sesiones/' + id + '/recursos', body, () => {
      const session = this.session(id);
      if (this.identity.role() !== 'TUTOR' || session.tutorId !== this.identity.user()!.id)
        this.fail(403);
      const item = { ...body, id: ++this.id, sesionId: id };
      this.recursos.push(item);
      return item;
    });
  }
  deleteRecurso(sessionId: number, id: number): Observable<void> {
    return this.run('DELETE', '/sesiones/' + sessionId + '/recursos/' + id, null, () => {
      if (
        this.identity.role() !== 'TUTOR' ||
        this.session(sessionId).tutorId !== this.identity.user()!.id
      )
        this.fail(403);
      this.recursos = this.recursos.filter((r) => r.id !== id || r.sesionId !== sessionId);
    });
  }
  listEvaluaciones(id: number): Observable<Evaluacion[]> {
    return this.run('GET', '/sesiones/' + id + '/evaluaciones', null, () => {
      if (!this.allowed(this.session(id))) this.fail(403);
      return this.evaluaciones.filter((e) => e.sesionId === id);
    });
  }
  evaluate(id: number, body: NuevaEvaluacion): Observable<Evaluacion> {
    return this.run('POST', '/sesiones/' + id + '/evaluaciones', body, () => {
      const session = this.session(id);
      if (
        this.identity.role() !== 'ESTUDIANTE' ||
        session.estudianteId !== this.identity.user()!.id
      )
        this.fail(403);
      if (session.estado !== 'COMPLETED' || this.evaluaciones.some((e) => e.sesionId === id))
        this.fail();
      const item = {
        ...body,
        id: ++this.id,
        sesionId: id,
        fechaEvaluacion: new Date().toISOString(),
      };
      this.evaluaciones.push(item);
      session.estado = 'REVIEWED';
      return item;
    });
  }
  error(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) return this.i18n.t('error');
    const key =
      error.status === 0
        ? 'network'
        : error.status === 401
          ? 'unauthorized'
          : error.status === 403
            ? 'forbidden'
            : error.status === 404
              ? 'notFound'
              : error.status === 409
                ? 'conflict'
                : 'error';
    return this.i18n.t(key);
  }
}
