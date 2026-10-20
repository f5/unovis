import { Component, ViewEncapsulation } from '@angular/core'
import * as c from './constants'

@Component({
  selector: 'patterned-temperature-lines',
  standalone: false,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './patterned-temperature-lines.component.html',
  styleUrls: ['./styles.css'],
})
export class PatternedTemperatureLinesComponent {
  c = c
  state = c.initialState
  view = c.getView(this.state)

  update (patch: Partial<c.ExampleState>): void {
    this.state = { ...this.state, ...patch }
    this.view = c.getView(this.state)
  }

  changeMode (event: Event): void {
    this.update({ mode: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
}
