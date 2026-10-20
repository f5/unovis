import { Component, ViewEncapsulation } from '@angular/core'
import * as c from './constants'

@Component({
  selector: 'penguin-distributions',
  standalone: false,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './penguin-distributions.component.html',
  styleUrls: ['./styles.css'],
})
export class PenguinDistributionsComponent {
  c = c
  state = c.initialState
  view = c.getView(this.state)

  update (patch: Partial<c.ExampleState>): void {
    this.state = { ...this.state, ...patch }
    this.view = c.getView(this.state)
  }

  changeSex (event: Event): void {
    this.update({ sex: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
}
