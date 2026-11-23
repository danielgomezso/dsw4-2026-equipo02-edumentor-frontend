import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { TextKey, translations } from './translations';
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly document = inject(DOCUMENT);
  readonly language = signal<'es' | 'en'>(this.read());
  constructor() { this.document.documentElement.lang = this.language(); }
  private read(): 'es' | 'en' { try { return localStorage.getItem('edumentor.language') === 'en' ? 'en' : 'es'; } catch { return 'es'; } }
  set(language: 'es' | 'en'): void { this.language.set(language); this.document.documentElement.lang = language; try { localStorage.setItem('edumentor.language', language); } catch { /* La traducción sigue disponible en memoria. */ } }
  t(key: TextKey): string { return translations[key][this.language() === 'es' ? 0 : 1]; }
  day(day: number): string { return new Intl.DateTimeFormat(this.language(), { weekday: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, 0, 4 + day))); }
  date(value: string): string { const date = new Date(value); return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat(this.language() === 'es' ? 'es-CR' : 'en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Costa_Rica' }).format(date); }
}
