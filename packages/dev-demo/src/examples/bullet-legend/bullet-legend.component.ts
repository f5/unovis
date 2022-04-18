import { AfterViewInit, OnDestroy, Component, ElementRef, ViewChild } from '@angular/core'
import _times from 'lodash/times'
import _random from 'lodash/random'

// Vis
import { XYContainer, XYContainerConfigInterface, Axis, Area, AreaConfigInterface, Tooltip, Crosshair, FreeBrush, FreeBrushMode } from '@volterra/vis'

// Helpers
import { SampleDatum } from '../../utils/data'

interface AreaSampleDatum extends SampleDatum {
  baseline: number;
}

function generateData (n = 10): AreaSampleDatum[] {
  return _times(n).map((i) => ({
    x: i,
    y: _random(-100, 0),
    y1: _random(0, 100),
    y2: _random(-100, 0),
    y3: _random(0, 100),
    y4: _random(0, 100),
    baseline: _random(30, 80),
  }))
}

@Component({
  selector: 'bullet-legend',
  templateUrl: './bullet-legend.component.html',
  styleUrls: ['./bullet-legend.component.css'],
})

export class BulletLegendExampleComponent implements AfterViewInit, OnDestroy {
  title = 'bullet-legend'
  yAccessors = [
    d => d.y,
    undefined,
    d => d.y2,
    d => d.y3,
    d => d.y4,
  ]

  legendItems: { name: string; inactive?: boolean }[] = this.yAccessors.map((d, i) => ({ name: `Stream ${i + 1}`, hidden: !d }))
  chartConfig: XYContainerConfigInterface<AreaSampleDatum>
  areaConfig: AreaConfigInterface<AreaSampleDatum>
  composite: XYContainer<AreaSampleDatum>
  intervalId: NodeJS.Timeout
  @ViewChild('chart', { static: false }) chart: ElementRef
  @ViewChild('legendRef', { static: false }) legendRef: ElementRef

  ngAfterViewInit (): void {
    const data: AreaSampleDatum[] = generateData()
    this.areaConfig = this.getAreaConfig(this.yAccessors)

    this.chartConfig = {
      margin: { top: 10, bottom: 10, left: 15, right: 10 },
      components: [
        new Area(this.areaConfig),
        new FreeBrush(
          {
            mode: FreeBrushMode.XY,
            selectionMinLength: [0.5, 5],
            autoHide: false,
            selection: [[2, 4], [0, 50]],
            onBrush: (s: [number, number]) => {
              // eslint-disable-next-line no-console
              console.log('onbrush', s)
            },
            onBrushStart: (s: [number, number]) => {
              // eslint-disable-next-line no-console
              console.log('onBrushStart', s)
            },
            onBrushMove: (s: [number, number]) => {
              // eslint-disable-next-line no-console
              console.log('onBrushMove', s)
            },
            onBrushEnd: (s: [number, number]) => {
              // eslint-disable-next-line no-console
              console.log('onBrushEnd', s)
            },
          }
        ),
      ],
      xAxis: new Axis({
        label: 'Index',
      }),
      yAxis: new Axis({
      }),
      tooltip: new Tooltip({
        triggers: {
          [Area.selectors.area]: (d) => '<span>Area</span>',
        },
      }),
      crosshair: new Crosshair({
        template: (d) => `<span>Index: ${d.x}</span>`,
      }),
    }

    this.composite = new XYContainer(this.chart.nativeElement, this.chartConfig, data)

    this.intervalId = setInterval(() => {
      this.composite.setData(generateData(20))
    }, 5000)
  }

  ngOnDestroy (): void {
    clearInterval(this.intervalId)
  }

  onLegendItemClick (event): void {
    const { d } = event
    d.inactive = !d.inactive
    this.legendItems = [...this.legendItems]
    const accessors = this.yAccessors.map((acc, i) => !this.legendItems[i].inactive ? acc : null)
    this.areaConfig.y = accessors
    this.composite.updateComponents([this.areaConfig])
  }

  getAreaConfig (y): AreaConfigInterface<AreaSampleDatum> {
    return {
      x: d => d.x,
      y,
      baseline: d => d.baseline,
      opacity: 0.8,
    }
  }
}
