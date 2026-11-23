import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HubPage } from '../../shared/hub/page';
import { FeedbackComponent } from '../../shared/hub/feedback.component';
import { Sesion } from './models';
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, FeedbackComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent extends HubPage implements OnInit {
  readonly sessions = signal<Sesion[]>([]);
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.request(this.api.listSesiones(), (sessions) =>
      this.sessions.set(
        sessions
          .filter(
            (s) =>
              ['REQUESTED', 'CONFIRMED'].includes(s.estado) && Date.parse(s.fechaHora) > Date.now(),
          )
          .sort((a, b) => Date.parse(a.fechaHora) - Date.parse(b.fechaHora))
          .slice(0, 5),
      ),
    );
  }
}
