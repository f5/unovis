import { Component, ViewEncapsulation } from '@angular/core'
import * as c from './constants'

@Component({
  selector: 'earthquake-explorer',
  standalone: false,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './earthquake-explorer.component.html',
  styleUrls: ['./styles.css'],
})
export class EarthquakeExplorerComponent {
  c = c
  state = c.initialState
  view = c.getView(this.state, patch => this.update(patch))

  update (patch: Partial<c.ExampleState>): void {
    this.state = { ...this.state, ...patch }
    this.view = c.getView(this.state, next => this.update(next))
  }

  changeMinimum (event: Event): void {
    this.update({ minimum: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  changeHalf (event: Event): void {
    this.update({ half: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
}
