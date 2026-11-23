import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { HubPage, notBlank, safeUrl } from '../../shared/hub/page';
import { FieldComponent } from '../../shared/hub/field.component';
import { FeedbackComponent } from '../../shared/hub/feedback.component';
import { Evaluacion, Recurso, Sesion } from './models';
@Component({
  selector: 'app-detalle',
  imports: [RouterLink, ReactiveFormsModule, FieldComponent, FeedbackComponent],
  templateUrl: './detalle.component.html',
})
export class DetalleComponent extends HubPage implements OnInit {
  private readonly fb = inject(FormBuilder).nonNullable;
  readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  readonly session = signal<Sesion | null>(null);
  readonly resources = signal<Recurso[]>([]);
  readonly reviews = signal<Evaluacion[]>([]);
  readonly resourceForm = this.fb.group({
    titulo: ['', [Validators.required, notBlank, Validators.maxLength(200)]],
    urlRecurso: ['', [Validators.required, safeUrl, Validators.maxLength(2048)]],
    tipoArchivo: ['PDF', [Validators.required, notBlank, Validators.maxLength(50)]],
  });
  readonly reviewForm = this.fb.group({
    calificacionEstrellas: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comentario: ['', Validators.maxLength(2000)],
  });
  readonly ratings = [1, 2, 3, 4, 5].map((value) => ({ value, label: value + ' / 5' }));
  get canAdd(): boolean {
    return this.identity.role() === 'TUTOR' && this.session()?.tutorId === this.identity.user()?.id;
  }
  get canReview(): boolean {
    return (
      this.identity.role() === 'ESTUDIANTE' &&
      this.session()?.estudianteId === this.identity.user()?.id &&
      this.session()?.estado === 'COMPLETED' &&
      !this.reviews().length
    );
  }
  safeLink(value: string): string | null {
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  }
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.request(
      forkJoin({
        session: this.api.getSesion(this.id),
        resources: this.api.listRecursos(this.id),
        reviews: this.api.listEvaluaciones(this.id),
      }),
      (data) => {
        this.session.set(data.session);
        this.resources.set(data.resources);
        this.reviews.set(data.reviews);
      },
    );
  }
  add(): void {
    if (!this.valid(this.resourceForm)) return;
    const body = this.resourceForm.getRawValue();
    body.titulo = body.titulo.trim();
    body.urlRecurso = body.urlRecurso.trim();
    this.request(
      this.api.addRecurso(this.id, body),
      (item) => {
        this.resources.update((items) => [...items, item]);
        this.resourceForm.reset();
      },
      true,
    );
  }
  remove(item: Recurso): void {
    if (confirm(this.i18n.t('confirmDelete')))
      this.request(
        this.api.deleteRecurso(this.id, item.id),
        () => this.resources.update((items) => items.filter((r) => r.id !== item.id)),
        true,
      );
  }
  evaluate(): void {
    if (!this.valid(this.reviewForm)) return;
    this.request(
      this.api.evaluate(this.id, this.reviewForm.getRawValue()),
      (item) => {
        this.reviews.set([item]);
        this.session.update((session) => (session ? { ...session, estado: 'REVIEWED' } : null));
      },
      true,
    );
  }
}
