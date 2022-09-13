import { Component } from '@angular/core'
import { FitMode } from '@unovis/ts'

import { data, NodeDatum } from './data'

@Component({
  selector: 'basic-sankey',
  templateUrl: './basic-sankey.component.html'
})
export class BasicSankeyComponent {
  data = data
  labelFit = FitMode.Wrap
  subLabel = (d: NodeDatum) => `£${d.value.toFixed(2)}`
}
