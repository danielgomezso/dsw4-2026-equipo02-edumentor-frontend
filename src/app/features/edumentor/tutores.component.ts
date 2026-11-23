import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HubPage } from '../../shared/hub/page';
import { FeedbackComponent } from '../../shared/hub/feedback.component';
import { Tutor } from './models';
@Component({ selector: 'app-tutores', imports: [RouterLink, FeedbackComponent], template: `
<header class="hub-heading"><p class="hub-eyebrow">EDUMENTOR HUB / {{ i18n.t('tutors') }}</p><h1>{{ i18n.t('tutors') }}</h1><p>{{ i18n.t('tutorIntro') }}</p></header><hub-feedback [page]="this" />
<div class="hub-toolbar"><div class="hub-field"><label for="tutor-search">{{ i18n.t('searchTutor') }}</label><input type="search" id="tutor-search" [value]="query()" (input)="query.set($any($event.target).value)" /></div><button class="hub-secondary" (click)="load()" [disabled]="loading()">{{ i18n.t('refresh') }}</button></div>
<section class="hub-tutor-list">@for (tutor of filtered(); track tutor.id) { <article class="hub-tutor"><div class="hub-avatar" aria-hidden="true">{{ tutor.nombre.slice(0, 1) }}{{ tutor.apellido.slice(0, 1) }}</div><div><p class="hub-eyebrow">{{ i18n.t('community') }}</p><h2>{{ tutor.nombre }} {{ tutor.apellido }}</h2><p>{{ i18n.t('availabilityIntro') }}</p></div><a class="hub-button" routerLink="/horarios" [queryParams]="{tutorId: tutor.id}">{{ i18n.t('profile') }}</a></article> } @empty { @if (!loading() && !failure()) { <p class="hub-empty">{{ i18n.t('noResults') }}</p> } }</section>
` })
export class TutoresComponent extends HubPage implements OnInit {
  readonly items = signal<Tutor[]>([]); readonly query = signal('');
  readonly filtered = computed(() => this.items().filter(t => (t.nombre + ' ' + t.apellido).toLocaleLowerCase().includes(this.query().trim().toLocaleLowerCase())));
  ngOnInit(): void { this.load(); } load(): void { this.request(this.api.listTutores(), items => this.items.set(items)); }
}
