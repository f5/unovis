import { Component } from '@angular/core'

// Helpers
import { sampleSeriesData, SampleDatum } from '../../utils/data'

@Component({
  selector: 'free-brush',
  templateUrl: './free-brush.component.html',
  styleUrls: ['./free-brush.component.css'],
})

export class FreeBrushComponent {
  title = 'free-brush'

  // Data
  data: SampleDatum[] = sampleSeriesData(10)
  margin = { top: 10, bottom: 10, left: 10, right: 10 }
  padding = {}
  baseline = (d: SampleDatum): number => d.y3
  x = (d: SampleDatum): number => d.x
  y = [
    (d: SampleDatum): number => d.y,
    (d: SampleDatum): number => d.y4,
  ]
}
