import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { I18nService } from '../../i18n/i18n.service';
import { IdentityService } from './identity.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  readonly i18n = inject(I18nService);
  readonly identity = inject(IdentityService);
  readonly busqueda = new FormControl('', { nonNullable: true });
  private readonly router = inject(Router);
  readonly steps = [
    { title: 'step1', text: 'step1text' },
    { title: 'step2', text: 'step2text' },
    { title: 'step3', text: 'step3text' },
  ] as const;

  buscar(event: Event): void {
    event.preventDefault();
    void this.router.navigate(['/materias'], {
      queryParams: { q: this.busqueda.value.trim() || null },
    });
  }
}
