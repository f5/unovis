import { AfterViewInit, Component } from '@angular/core'

// Vis
import { GroupedBar, GroupedBarConfigInterface, Axis } from '@volterra/vis'

// Helpers
import { SampleDatum, sampleSeriesData } from '../../utils/data'

function getGroupedBarConfig (): GroupedBarConfigInterface<SampleDatum> {
  return {
    x: d => d.x,
    y: [
      d => d.y,
      d => d.y1,
      d => d.y2,
    ],
    roundedCorners: true,
    cursor: (d, i) => i % 2 ? 'pointer' : null,
  }
}

@Component({
  selector: 'grouped-bar',
  templateUrl: './grouped-bar.component.html',
  styleUrls: ['./grouped-bar.component.css'],
})

export class GroupedBarComponent implements AfterViewInit {
  title = 'grouped-bar'
  component = GroupedBar

  configGenerator = getGroupedBarConfig
  dataGenerator = sampleSeriesData
  axesGenerator = (): { x: Axis<SampleDatum>; y: Axis<SampleDatum> } => ({
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  })

  ngAfterViewInit (): void {
    //
  }
}
