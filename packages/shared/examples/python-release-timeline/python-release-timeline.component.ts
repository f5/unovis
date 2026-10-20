import { Component, ViewEncapsulation } from '@angular/core'
import * as c from './constants'

@Component({
  selector: 'python-release-timeline',
  standalone: false,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './python-release-timeline.component.html',
  styleUrls: ['./styles.css'],
})
export class PythonReleaseTimelineComponent {
  c = c
  state = c.initialState
  view = c.getView(this.state)

  update (patch: Partial<c.ExampleState>): void {
    this.state = { ...this.state, ...patch }
    this.view = c.getView(this.state)
  }

  changeStatus (event: Event): void {
    this.update({ status: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
}
