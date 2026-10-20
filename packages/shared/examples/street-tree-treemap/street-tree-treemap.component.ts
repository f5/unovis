import { Component, ViewEncapsulation } from '@angular/core'
import * as c from './constants'

@Component({
  selector: 'street-tree-treemap',
  standalone: false,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './street-tree-treemap.component.html',
  styleUrls: ['./styles.css'],
})
export class StreetTreeTreemapComponent {
  c = c
  state = c.initialState
  view = c.getView(this.state, patch => this.update(patch))

  update (patch: Partial<c.ExampleState>): void {
    this.state = { ...this.state, ...patch }
    this.view = c.getView(this.state, next => this.update(next))
  }

  changeBorough (event: Event): void {
    this.update({ borough: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  changeQuery (event: Event): void {
    this.update({ query: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
}
