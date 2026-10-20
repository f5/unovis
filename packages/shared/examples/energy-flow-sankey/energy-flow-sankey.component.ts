import { Component, ViewEncapsulation } from '@angular/core'
import * as c from './constants'

@Component({
  selector: 'energy-flow-sankey',
  standalone: false,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './energy-flow-sankey.component.html',
  styleUrls: ['./styles.css'],
})
export class EnergyFlowSankeyComponent {
  c = c
  state = c.initialState
  view = c.getView(this.state, patch => this.update(patch))

  update (patch: Partial<c.ExampleState>): void {
    this.state = { ...this.state, ...patch }
    this.view = c.getView(this.state, next => this.update(next))
  }

  changeFocus (event: Event): void {
    this.update({ focus: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
}
