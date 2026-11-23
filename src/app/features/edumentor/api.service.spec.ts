import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { IdentityService } from './identity.service';
import { I18nService } from '../../i18n/i18n.service';
import { API_URL } from '../../core/models/auth.models';

describe('ApiService con API real', () => {
  let api: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(), provideHttpClientTesting(),
        { provide: IdentityService, useValue: { demo: false } },
        { provide: I18nService, useValue: { t: (key: string) => key } },
      ],
    });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('consulta los horarios por tutor y los combina', () => {
    let ids: number[] = [];
    api.listHorarios().subscribe((items) => ids = items.map((item) => item.id));
    http.expectOne(API_URL + '/usuarios/tutores').flush([{ id: 2 }, { id: 4 }]);
    http.expectOne(API_URL + '/disponibilidades?tutorId=2').flush([{ id: 10 }]);
    http.expectOne(API_URL + '/disponibilidades?tutorId=4').flush([{ id: 20 }]);
    expect(ids).toEqual([10, 20]);
  });

  it('devuelve una lista vacia cuando no hay tutores', () => {
    let result: unknown;
    api.listHorarios().subscribe((items) => result = items);
    http.expectOne(API_URL + '/usuarios/tutores').flush([]);
    expect(result).toEqual([]);
  });

  it('convierte la evaluacion individual a la lista usada por la pantalla', () => {
    let result: unknown;
    api.listEvaluaciones(2).subscribe((items) => result = items);
    http.expectOne(API_URL + '/sesiones/2/evaluacion').flush({ id: 7, sesionId: 2 });
    expect(result).toEqual([{ id: 7, sesionId: 2 }]);
  });

  it('permite mostrar una sesion que todavia no tiene evaluacion', () => {
    let result: unknown;
    api.listEvaluaciones(2).subscribe((items) => result = items);
    http.expectOne(API_URL + '/sesiones/2/evaluacion').flush({}, { status: 404, statusText: 'Not Found' });
    expect(result).toEqual([]);
  });

  it('no oculta errores de permisos al consultar evaluaciones', () => {
    let status = 0;
    api.listEvaluaciones(2).subscribe({ error: (error) => status = error.status });
    http.expectOne(API_URL + '/sesiones/2/evaluacion').flush({}, { status: 403, statusText: 'Forbidden' });
    expect(status).toBe(403);
  });

  it('envia la evaluacion a la ruta del backend', () => {
    const body = { calificacionEstrellas: 5, comentario: 'Bien' };
    api.evaluate(2, body).subscribe();
    const req = http.expectOne(API_URL + '/sesiones/2/evaluacion');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ id: 7, ...body });
  });

  it('cancela utilizando la ruta del backend', () => {
    api.cancel(2).subscribe();
    const req = http.expectOne(API_URL + '/sesiones/2/cancelar');
    expect(req.request.method).toBe('PATCH');
    req.flush({ id: 2, estado: 'CANCELLED' });
  });
});
