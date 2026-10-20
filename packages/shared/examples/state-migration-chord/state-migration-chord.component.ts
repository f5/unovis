import { Component, ViewEncapsulation } from '@angular/core'
import * as c from './constants'

@Component({
  selector: 'state-migration-chord',
  standalone: false,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './state-migration-chord.component.html',
  styleUrls: ['./styles.css'],
})
export class StateMigrationChordComponent {
  c = c
  state = c.initialState
  view = c.getView(this.state, patch => this.update(patch))

  update (patch: Partial<c.ExampleState>): void {
    this.state = { ...this.state, ...patch }
    this.view = c.getView(this.state, next => this.update(next))
  }

  changeSelected (event: Event): void {
    this.update({ selected: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
}
