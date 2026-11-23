import { Component, Input, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { I18nService } from '../../i18n/i18n.service';
@Component({ selector: 'hub-field', imports: [ReactiveFormsModule], template: `
  <div class="hub-field">
    <label [for]="id">{{ label }}</label>
    @if (type === 'select') {
      <select [id]="id" [formControl]="control" [attr.aria-invalid]="invalid" [attr.aria-describedby]="invalid ? id + '-error' : null">
        @for (option of options; track option.value) { <option [ngValue]="option.value">{{ option.label }}</option> }
      </select>
    } @else if (type === 'textarea') {
      <textarea [id]="id" [formControl]="control" rows="3" [attr.maxlength]="maxLength" [attr.aria-invalid]="invalid" [attr.aria-describedby]="invalid ? id + '-error' : null"></textarea>
    } @else {
      <input [id]="id" [type]="type" [formControl]="control" [attr.min]="min" [attr.max]="max" [attr.maxlength]="maxLength" [attr.step]="type === 'number' ? 1 : null" [attr.aria-invalid]="invalid" [attr.aria-describedby]="invalid ? id + '-error' : null" />
    }
    @if (invalid) { <span class="error" [id]="id + '-error'">{{ message }}</span> }
  </div>
` })
export class FieldComponent {
  readonly i18n = inject(I18nService);
  // Cada formulario conserva su tipo concreto; el campo visual admite valores heterogéneos.
  @Input({ required: true }) control!: FormControl;
  @Input({ required: true, alias: 'fieldId' }) id = '';
  @Input({ required: true }) label = '';
  @Input() type = 'text';
  @Input() min: number | null = null;
  @Input() max: number | null = null;
  @Input() maxLength: number | null = null;
  @Input() options: { value: string | number; label: string }[] = [];
  get invalid(): boolean { return this.control.invalid && this.control.touched; }
  get message(): string { return this.i18n.t(this.control.hasError('required') || this.control.hasError('blank') ? 'required' : this.control.hasError('maxlength') ? 'tooLong' : this.control.hasError('url') ? 'urlError' : 'invalid'); }
}
