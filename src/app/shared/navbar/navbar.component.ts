import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IdentityService } from '../../features/edumentor/identity.service';
import { I18nService } from '../../i18n/i18n.service';
@Component({ selector: 'app-navbar', imports:[RouterLink,RouterLinkActive], templateUrl:'./navbar.component.html', styleUrl:'./navbar.component.css' })
export class NavbarComponent { readonly identity = inject(IdentityService); readonly i18n = inject(I18nService); }
