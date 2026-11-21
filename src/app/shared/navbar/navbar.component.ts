import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ROLE_PERMISSIONS } from '../../core/models/auth.models';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  protected readonly auth = inject(AuthService);

  protected readonly permissions = computed(() => {
    const role = this.auth.role();
    return role ? ROLE_PERMISSIONS[role] : [];
  });

  logout(): void {
    this.auth.logout();
  }
}
