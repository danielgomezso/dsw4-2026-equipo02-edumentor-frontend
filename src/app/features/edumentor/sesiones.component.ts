import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { HubPage, integer } from '../../shared/hub/page';
import { FieldComponent } from '../../shared/hub/field.component';
import { FeedbackComponent } from '../../shared/hub/feedback.component';
import { Estado, Materia, Sesion, Tutor } from './models';
@Component({ selector: 'app-sesiones', imports: [RouterLink, ReactiveFormsModule, FieldComponent, FeedbackComponent], templateUrl: './sesiones.component.html' })
export class SesionesComponent extends HubPage implements OnInit {
  private readonly fb = inject(FormBuilder).nonNullable; private readonly route = inject(ActivatedRoute);
  readonly items = signal<Sesion[]>([]); readonly tutors = signal<Tutor[]>([]); readonly subjects = signal<Materia[]>([]); readonly status = signal(''); readonly invalidDate = signal(false);
  readonly states: Estado[] = ['REQUESTED','CONFIRMED','REJECTED','CANCELLED','IN_SESSION','COMPLETED','REVIEWED'];
  readonly filtered = computed(() => this.items().filter(s => !this.status() || s.estado === this.status()).sort((a,b) => Date.parse(b.fechaHora)-Date.parse(a.fechaHora)));
  readonly form = this.fb.group({ tutorId: [Number(this.route.snapshot.queryParamMap.get('tutorId')) || 0, [Validators.required, Validators.min(1)]], materiaId: [0, [Validators.required, Validators.min(1)]], fechaHora: ['', Validators.required], duracionMinutos: [60, [Validators.required, Validators.min(15), Validators.max(240), integer]], modalidad: this.fb.control<'VIRTUAL'|'PRESENCIAL'>('VIRTUAL', Validators.required), resumen: ['', Validators.maxLength(2000)] });
  get tutorOptions(): {value:number;label:string}[] { return [{value:0,label:this.i18n.t('select')}, ...this.tutors().map(t => ({value:t.id,label:t.nombre+' '+t.apellido}))]; }
  get subjectOptions(): {value:number;label:string}[] { return [{value:0,label:this.i18n.t('select')}, ...this.subjects().map(m => ({value:m.id,label:m.codigoMateria+' · '+m.nombreMateria}))]; }
  get modes(): {value:string;label:string}[] { return ['VIRTUAL','PRESENCIAL'].map(value => ({value,label:this.i18n.t(value as 'VIRTUAL'|'PRESENCIAL')})); }
  subject(id: number): string { const item = this.subjects().find(s => s.id === id); return item ? item.nombreMateria : '#'+id; }
  tutor(id: number): string { const item = this.tutors().find(t => t.id === id); return item ? item.nombre+' '+item.apellido : '#'+id; }
  ngOnInit(): void { this.load(); }
  load(): void { this.request(forkJoin({ items:this.api.listSesiones(), tutors:this.api.listTutores(), subjects:this.api.listMaterias() }), data => { this.items.set(data.items); this.tutors.set(data.tutors); this.subjects.set(data.subjects); }); }
  reserve(): void { if (!this.valid(this.form)) return; const body = this.form.getRawValue(); const date = Date.parse(body.fechaHora + ':00-06:00'); this.invalidDate.set(!Number.isFinite(date) || date <= Date.now()); if (this.invalidDate()) return; body.fechaHora += ':00-06:00'; this.request(this.api.reserve(body), item => { this.items.update(items => [...items,item]); this.form.reset(); this.status.set(''); }, true); }
  cancel(item: Sesion): void { if (confirm(this.i18n.t('confirmCancel'))) this.request(this.api.cancel(item.id), updated => this.items.update(items => items.map(s => s.id === updated.id ? updated : s)), true); }
}
