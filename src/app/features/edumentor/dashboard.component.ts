import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HubPage } from '../../shared/hub/page';
import { FeedbackComponent } from '../../shared/hub/feedback.component';
import { Sesion } from './models';
@Component({ selector: 'app-dashboard', imports: [RouterLink, FeedbackComponent], template: `
<header class="hub-heading"><p class="hub-eyebrow">{{ i18n.t('hello') }}, {{ identity.user()?.nombre }}</p><h1>{{ i18n.t('dashboard') }}</h1><p>{{ i18n.t('dashboardText') }}</p></header>
<div class="hub-shortcuts"><a routerLink="/materias">{{ i18n.t('subjects') }} <span aria-hidden="true">↗</span></a><a [routerLink]="identity.role() === 'ESTUDIANTE' ? '/tutores' : '/horarios'">{{ i18n.t(identity.role() === 'ESTUDIANTE' ? 'tutors' : 'schedule') }} <span aria-hidden="true">↗</span></a><a routerLink="/sesiones">{{ i18n.t('sessions') }} <span aria-hidden="true">↗</span></a></div>
<section class="hub-panel"><div class="hub-section-title"><h2>{{ i18n.t('upcoming') }}</h2><a routerLink="/sesiones">{{ i18n.t('openSessions') }}</a></div><hub-feedback [page]="this" />
@if (failure()) { <button class="hub-secondary" (click)="load()">{{ i18n.t('retry') }}</button> }
@for (session of sessions(); track session.id) { <article class="hub-list-row"><div><h3>{{ i18n.t('session') }} #{{ session.id }}</h3><p>{{ i18n.date(session.fechaHora) }} · {{ session.duracionMinutos }} {{ i18n.t('minutes') }}</p></div><a [routerLink]="['/sesiones', session.id]">{{ i18n.t('details') }}</a></article> } @empty { @if (!loading() && !failure()) { <p class="hub-empty">{{ i18n.t('emptyUpcoming') }}</p> } }
</section>
` })
export class DashboardComponent extends HubPage implements OnInit {
  readonly sessions = signal<Sesion[]>([]);
  ngOnInit(): void { this.load(); }
  load(): void { this.request(this.api.listSesiones(), sessions => this.sessions.set(sessions.filter(s => ['REQUESTED', 'CONFIRMED'].includes(s.estado) && Date.parse(s.fechaHora) > Date.now()).sort((a,b) => Date.parse(a.fechaHora)-Date.parse(b.fechaHora)).slice(0,5))); }
}
