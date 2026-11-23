import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HubPage } from '../../shared/hub/page';
import { FeedbackComponent } from '../../shared/hub/feedback.component';
import { Tutor } from './models';
@Component({
  selector: 'app-tutores',
  imports: [RouterLink, FeedbackComponent],
  templateUrl: './tutores.component.html',
})
export class TutoresComponent extends HubPage implements OnInit {
  readonly items = signal<Tutor[]>([]);
  readonly query = signal('');
  readonly filtered = computed(() =>
    this.items().filter((t) =>
      (t.nombre + ' ' + t.apellido)
        .toLocaleLowerCase()
        .includes(this.query().trim().toLocaleLowerCase()),
    ),
  );
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.request(this.api.listTutores(), (items) => this.items.set(items));
  }
}
