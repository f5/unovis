import { AfterViewInit, Component } from '@angular/core'
import { scaleSqrt } from 'd3-scale'
import _times from 'lodash/times'
import _random from 'lodash/random'

// Vis
import { Donut, DonutConfigInterface } from '@unovis/ts'

// Helpers
import { sampleSeriesData, SampleDatum } from '../../utils/data'

@Component({
  selector: 'donut',
  templateUrl: './donut.component.html',
  styleUrls: ['./donut.component.scss'],
})

export class DonutChartComponent implements AfterViewInit {
  dataDomain = [0, 5]
  radiusRange = [50, 92]
  radiusScale = scaleSqrt()
    .domain(this.dataDomain)
    .range(this.radiusRange)
    .clamp(true)

  donuts = _times(10).map(() => {
    const data = sampleSeriesData(_random(1, 10))
    const sum = data.reduce((sum, d) => sum + d.y, 0)

    const config: DonutConfigInterface<SampleDatum> = {
      id: (d, i) => i,
      value: d => d.y,
      centralLabel: `${sum.toFixed(2)}K`,
      centralSubLabel: 'Total Events',
      radius: this.radiusScale(sum),
      duration: 1000,
      arcWidth: 25,
      showEmptySegments: true,
      showBackground: true,
      angleRange: [0, 2 * Math.PI * Math.random()],
      backgroundAngleRange: [0, 2 * Math.PI],
      // color: 'grey',
    }

    return {
      config,
      data,
      component: new Donut(config),
    }
  })

  ngAfterViewInit (): void {
    setInterval(() => {
      this.donuts.forEach(donut => {
        const data = sampleSeriesData(_random(1, 10))
        const sum = data.reduce((sum, d) => sum + d.y, 0)

        donut.data = data
        donut.config = {
          ...donut.config,
          centralLabel: `${sum.toFixed(2)}K`,
          radius: this.radiusScale(sum),
        }
      })
    }, 2000)
  }
}
