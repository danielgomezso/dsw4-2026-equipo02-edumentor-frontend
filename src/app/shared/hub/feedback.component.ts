import { Component, Input, inject } from '@angular/core';
import { HubPage } from './page';
import { I18nService } from '../../i18n/i18n.service';
@Component({ selector: 'hub-feedback', template: `
  @if (page.loading()) { <p role="status">{{ i18n.t('loading') }}</p> }
  @if (page.failure()) { <p class="hub-alert" role="alert">{{ page.api.error(page.failure()) }}</p> }
  @if (page.success()) { <p class="hub-success" role="status">{{ i18n.t('saved') }}</p> }
` })
export class FeedbackComponent { @Input({ required: true }) page!: HubPage; readonly i18n = inject(I18nService); }
