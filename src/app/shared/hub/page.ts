import { DestroyRef, Directive, inject, signal } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize } from 'rxjs';
import { ApiService } from '../../features/edumentor/api.service';
import { IdentityService } from '../../features/edumentor/identity.service';
import { I18nService } from '../../i18n/i18n.service';
export const notBlank: ValidatorFn = control => typeof control.value === 'string' && !control.value.trim() ? { blank: true } : null;
export const integer: ValidatorFn = control => Number.isInteger(control.value) ? null : { integer: true };
export const safeUrl: ValidatorFn = control => { try { const url = new URL(String(control.value)); return ['https:', 'http:'].includes(url.protocol) && !!url.hostname ? null : { url: true }; } catch { return { url: true }; } };
export const timeRange: ValidatorFn = (control: AbstractControl): ValidationErrors | null => control.get('horaFin')?.value > control.get('horaInicio')?.value ? null : { range: true };
@Directive()
export abstract class HubPage {
  readonly api = inject(ApiService);
  readonly identity = inject(IdentityService);
  readonly i18n = inject(I18nService);
  private readonly destroy = inject(DestroyRef);
  readonly busy = signal(false);
  readonly loading = signal(false);
  readonly failure = signal<unknown>(null);
  readonly success = signal(false);
  request<T>(request: Observable<T>, next: (value: T) => void, write = false): void {
    if (this.busy() || this.loading()) return;
    const state = write ? this.busy : this.loading;
    state.set(true); this.failure.set(null); this.success.set(false);
    request.pipe(takeUntilDestroyed(this.destroy), finalize(() => state.set(false))).subscribe({ next: value => { state.set(false); next(value); if (write) this.success.set(true); }, error: error => this.failure.set(error) });
  }
  valid(form: FormGroup): boolean { form.markAllAsTouched(); if (form.valid) return true; queueMicrotask(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()); return false; }
}
