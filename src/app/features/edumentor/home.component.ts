import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../i18n/i18n.service';
import { IdentityService } from './identity.service';
@Component({ selector: 'app-home', imports: [RouterLink], template: `
<section class="hub-hero">
  <div><p class="hub-eyebrow">{{ i18n.t('eyebrow') }}</p><h1>{{ i18n.t('welcome') }}</h1><p class="hub-lead">{{ i18n.t('intro') }}</p>
  <a class="hub-button" [routerLink]="identity.user() ? '/tutores' : '/registro'">{{ i18n.t(identity.user() ? 'tutors' : 'register') }}</a></div>
  <aside class="hub-notebook" aria-label="EduMentor Hub"><span class="hub-bookmark">EduMentor / Hub</span><h2>{{ i18n.t('start') }}</h2><ol><li>{{ i18n.t('step1') }}</li><li>{{ i18n.t('step2') }}</li><li>{{ i18n.t('step3') }}</li></ol></aside>
</section>
<section class="hub-steps" [attr.aria-label]="i18n.t('start')">
  @for (step of steps; track step.title; let index = $index) { <article><span class="hub-number">0{{ index + 1 }}</span><h2>{{ i18n.t(step.title) }}</h2><p>{{ i18n.t(step.text) }}</p></article> }
</section>
` })
export class HomeComponent {
  readonly i18n = inject(I18nService); readonly identity = inject(IdentityService);
  readonly steps = [{ title: 'step1', text: 'step1text' }, { title: 'step2', text: 'step2text' }, { title: 'step3', text: 'step3text' }] as const;
}
