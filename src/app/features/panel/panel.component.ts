import { Component, computed, inject } from '@angular/core';
import { ROLE_PERMISSIONS } from '../../core/models/auth.models';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-panel',
  template: `
    @if (auth.user(); as user) {
      <section class="tarjeta">
        <h1>SOY {{ user.rol }}</h1>
        <p class="subtitulo">
          {{ user.nombre }} {{ user.apellido }} · {{ user.carne }} · {{ user.email }}
        </p>
        <h2>Permisos habilitados para {{ user.rol }}</h2>
        <ul>
          @for (item of permissions(); track item) {
            <li>{{ item }}</li>
          }
        </ul>
      </section>
    }
  `,
})
export class PanelComponent {
  protected readonly auth = inject(AuthService);

  protected readonly permissions = computed(() => {
    const role = this.auth.role();
    return role ? ROLE_PERMISSIONS[role] : [];
  });
}
