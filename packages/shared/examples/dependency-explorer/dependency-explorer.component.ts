import { Component, ViewEncapsulation } from '@angular/core'
import * as c from './constants'

@Component({
  selector: 'dependency-explorer',
  standalone: false,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './dependency-explorer.component.html',
  styleUrls: ['./styles.css'],
})
export class DependencyExplorerComponent {
  c = c
  state = c.initialState
  view = c.getView(this.state, patch => this.update(patch))

  update (patch: Partial<c.ExampleState>): void {
    this.state = { ...this.state, ...patch }
    this.view = c.getView(this.state, next => this.update(next))
  }

  changeQuery (event: Event): void {
    this.update({ query: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  changeLayout (event: Event): void {
    this.update({ layout: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
}
