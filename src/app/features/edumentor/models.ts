export interface Materia { id: number; codigoMateria: string; nombreMateria: string; carrera: string; creditos: number; }
export interface Tutor { id: number; nombre: string; apellido: string; }
export interface Disponibilidad { id: number; tutorId: number; diaSemana: number; horaInicio: string; horaFin: string; estaActivo: boolean; }
export type Estado = 'REQUESTED' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'IN_SESSION' | 'COMPLETED' | 'REVIEWED';
export interface Sesion { id: number; estudianteId: number; tutorId: number; materiaId: number; fechaHora: string; duracionMinutos: number; estado: Estado; modalidad: 'VIRTUAL' | 'PRESENCIAL'; resumen: string; }
export interface Recurso { id: number; sesionId: number; titulo: string; urlRecurso: string; tipoArchivo: string; }
export interface Evaluacion { id: number; sesionId: number; calificacionEstrellas: number; comentario: string; fechaEvaluacion: string; }
export type NuevaSesion = Pick<Sesion, 'tutorId' | 'materiaId' | 'fechaHora' | 'duracionMinutos' | 'modalidad' | 'resumen'>;
export type NuevaDisponibilidad = Omit<Disponibilidad, 'id' | 'tutorId'>;
export type NuevaEvaluacion = Pick<Evaluacion, 'calificacionEstrellas' | 'comentario'>;
export type NuevoRecurso = Pick<Recurso, 'titulo' | 'urlRecurso' | 'tipoArchivo'>;
