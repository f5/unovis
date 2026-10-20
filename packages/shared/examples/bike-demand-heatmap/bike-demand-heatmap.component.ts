import { Component, ViewEncapsulation } from '@angular/core'
import * as c from './constants'

@Component({
  selector: 'bike-demand-heatmap',
  standalone: false,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './bike-demand-heatmap.component.html',
  styleUrls: ['./styles.css'],
})
export class BikeDemandHeatmapComponent {
  c = c
  state = c.initialState
  view = c.getView(this.state)

  update (patch: Partial<c.ExampleState>): void {
    this.state = { ...this.state, ...patch }
    this.view = c.getView(this.state)
  }

  changeRider (event: Event): void {
    this.update({ rider: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
}
