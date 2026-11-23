import { Component, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HubPage, integer, notBlank } from '../../shared/hub/page';
import { FieldComponent } from '../../shared/hub/field.component';
import { FeedbackComponent } from '../../shared/hub/feedback.component';
import { ActivatedRoute } from '@angular/router';
import { Materia } from './models';
@Component({
  selector: 'app-materias',
  imports: [ReactiveFormsModule, FieldComponent, FeedbackComponent],
  templateUrl: './materias.component.html',
})
export class MateriasComponent extends HubPage implements OnInit {
  @ViewChild('subjectDialog') private subjectDialog?: ElementRef<HTMLDialogElement>;
  private readonly fb = inject(FormBuilder).nonNullable;
  readonly items = signal<Materia[]>([]);
  readonly query = signal(inject(ActivatedRoute).snapshot.queryParamMap.get('q') ?? '');
  readonly editing = signal<number | undefined>(undefined);
  readonly filtered = computed(() => {
    const q = this.query().trim().toLocaleLowerCase();
    return this.items().filter((m) =>
      [m.codigoMateria, m.nombreMateria, m.carrera].join(' ').toLocaleLowerCase().includes(q),
    );
  });
  readonly form = this.fb.group({
    codigoMateria: ['', [Validators.required, notBlank, Validators.maxLength(20)]],
    nombreMateria: ['', [Validators.required, notBlank, Validators.maxLength(150)]],
    carrera: ['', [Validators.required, notBlank, Validators.maxLength(150)]],
    creditos: [1, [Validators.required, Validators.min(1), integer]],
  });
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.request(this.api.listMaterias(), (items) => this.items.set(items));
  }
  openNew(): void {
    this.clear();
    this.subjectDialog?.nativeElement.showModal();
    document.getElementById('subject-code')?.focus();
  }
  edit(item: Materia): void {
    this.editing.set(item.id);
    this.form.patchValue(item);
    this.subjectDialog?.nativeElement.showModal();
    document.getElementById('subject-code')?.focus();
  }
  clear(): void {
    if (this.subjectDialog?.nativeElement.open) this.subjectDialog.nativeElement.close();
    this.editing.set(undefined);
    this.form.reset();
  }
  save(): void {
    if (!this.valid(this.form)) return;
    const body = this.form.getRawValue();
    body.codigoMateria = body.codigoMateria.trim();
    body.nombreMateria = body.nombreMateria.trim();
    body.carrera = body.carrera.trim();
    this.request(
      this.api.saveMateria(body, this.editing()),
      (item) => {
        this.items.update((items) =>
          this.editing() ? items.map((m) => (m.id === item.id ? item : m)) : [...items, item],
        );
        this.clear();
      },
      true,
    );
  }
  remove(item: Materia): void {
    if (confirm(this.i18n.t('confirmDelete')))
      this.request(
        this.api.deleteMateria(item.id),
        () => this.items.update((items) => items.filter((m) => m.id !== item.id)),
        true,
      );
  }
}
