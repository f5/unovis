import { Component } from '@angular/core'
import { BulletLegendItemInterface, CurveType} from '@unovis/ts'
import { candidates, data, DataRecord } from './data'

@Component({
  selector: 'step-area-chart',
  templateUrl: './step-area-chart.component.html',
  styleUrls: ['./styles.css'],
})
export class StepAreaChartComponent {
  candidates: BulletLegendItemInterface[]
  curveType = CurveType.Step
  data = data
  legendItems = Object.keys(data[0][candidates[0].name]).map(c => ({ name: c as string }))
  x = (d: DataRecord): number => d.year
  y: ((d: DataRecord)=> number)[]

  constructor() {
    this.setCandidate(candidates[0])
  }

  setCandidate = (candidate: BulletLegendItemInterface): void => {
    this.candidates = candidates.map(c => ({ ...c, inactive: candidate.name !== c.name }))
    this.y = this.legendItems.map(i => (d: DataRecord) => d[candidate.name][i.name])
  }
}
