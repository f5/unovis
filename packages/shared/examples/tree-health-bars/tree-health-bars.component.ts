import { Component, ViewEncapsulation } from '@angular/core'
import * as c from './constants'

@Component({
  selector: 'tree-health-bars',
  standalone: false,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './tree-health-bars.component.html',
  styleUrls: ['./styles.css'],
})
export class TreeHealthBarsComponent {
  c = c
  state = c.initialState
  view = c.getView(this.state)

  update (patch: Partial<c.ExampleState>): void {
    this.state = { ...this.state, ...patch }
    this.view = c.getView(this.state)
  }

  changeSort (event: Event): void {
    this.update({ sort: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
}
