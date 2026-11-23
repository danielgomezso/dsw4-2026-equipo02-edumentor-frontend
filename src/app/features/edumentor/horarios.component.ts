import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { HubPage, timeRange } from '../../shared/hub/page';
import { FieldComponent } from '../../shared/hub/field.component';
import { FeedbackComponent } from '../../shared/hub/feedback.component';
import { Disponibilidad, Tutor } from './models';
@Component({ selector: 'app-horarios', imports: [RouterLink, ReactiveFormsModule, FieldComponent, FeedbackComponent], templateUrl: './horarios.component.html' })
export class HorariosComponent extends HubPage implements OnInit {
  private readonly fb = inject(FormBuilder).nonNullable; private readonly route = inject(ActivatedRoute);
  readonly items = signal<Disponibilidad[]>([]); readonly tutors = signal<Tutor[]>([]); readonly tutorId = signal(Number(this.route.snapshot.queryParamMap.get('tutorId')) || 0); readonly editing = signal<number | undefined>(undefined);
  readonly filtered = computed(() => this.items().filter(h => (this.identity.role() === 'TUTOR' ? h.tutorId === this.identity.user()?.id : (!this.tutorId() || h.tutorId === this.tutorId()) && h.estaActivo)).sort((a,b) => a.diaSemana-b.diaSemana || a.horaInicio.localeCompare(b.horaInicio)));
  readonly form = this.fb.group({ diaSemana: [1, [Validators.required, Validators.min(1), Validators.max(7)]], horaInicio: ['08:00', Validators.required], horaFin: ['09:00', Validators.required], estaActivo: [true] }, { validators: timeRange });
  get days(): { value: number; label: string }[] { return Array.from({length:7}, (_,i) => ({value:i+1,label:this.i18n.day(i+1)})); }
  get profile(): Tutor | undefined { return this.tutors().find(t => t.id === this.tutorId()); }
  tutorName(id: number): string { const tutor = this.tutors().find(t => t.id === id); return tutor ? tutor.nombre + ' ' + tutor.apellido : '#' + id; }
  ngOnInit(): void { this.load(); }
  load(): void { this.request(forkJoin({ items: this.api.listHorarios(), tutors: this.api.listTutores() }), data => { this.items.set(data.items); this.tutors.set(data.tutors); }); }
  edit(item: Disponibilidad): void { this.editing.set(item.id); this.form.patchValue({ ...item, horaInicio: item.horaInicio.slice(0,5), horaFin:item.horaFin.slice(0,5) }); document.getElementById('slot-day')?.focus(); }
  clear(): void { this.editing.set(undefined); this.form.reset(); }
  save(): void { if (!this.valid(this.form)) return; this.request(this.api.saveHorario(this.form.getRawValue(), this.editing()), item => { this.items.update(items => this.editing() ? items.map(h => h.id === item.id ? item : h) : [...items,item]); this.clear(); }, true); }
  toggle(item: Disponibilidad): void { this.request(this.api.saveHorario({ diaSemana:item.diaSemana, horaInicio:item.horaInicio, horaFin:item.horaFin, estaActivo:!item.estaActivo }, item.id), updated => this.items.update(items => items.map(h => h.id === item.id ? updated : h)), true); }
  remove(item: Disponibilidad): void { if (confirm(this.i18n.t('confirmDelete'))) this.request(this.api.deleteHorario(item.id), () => this.items.update(items => items.filter(h => h.id !== item.id)), true); }
}
