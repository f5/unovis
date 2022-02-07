// Copyright (c) Volterra, Inc. All rights reserved.
import { AfterViewInit, OnDestroy, Component, ElementRef, ViewChild } from '@angular/core'
import _times from 'lodash/times'
import _random from 'lodash/random'

// Vis
import {
  XYContainer,
  XYContainerConfigInterface,
  Axis,
  StackedBarConfigInterface,
  Tooltip,
  Crosshair,
  StackedBar,
  Orientation,
  NumericAccessor,
  Direction,
} from '@volterra/vis'

// Helpers
import { SampleDatum } from '../../utils/data'

function generateData (n = 10): SampleDatum[] {
  return _times(n).map((i) => ({
    x: i,
    y: _random(-100, 0),
    y1: _random(0, 100),
    y2: _random(-100, 0),
    y3: _random(0, 100),
    y4: _random(0, 100),
  }))
}

@Component({
  selector: 'horizontal-bar',
  templateUrl: './horizontal-bar.component.html',
  styleUrls: ['./horizontal-bar.component.css'],
})

export class HorizontalBarComponent implements AfterViewInit, OnDestroy {
  title = 'horizontal-bar'
  yAccessors: NumericAccessor<SampleDatum>[] = [
    d => d.y,
    undefined,
    d => d.y2,
    d => d.y3,
    d => d.y4,
  ]

  legendItems: { name: string; inactive?: boolean }[] = this.yAccessors.map((d, i) => ({ name: `Stream ${i + 1}`, hidden: !d }))
  chartConfig: XYContainerConfigInterface<SampleDatum>
  areaConfig: StackedBarConfigInterface<SampleDatum>
  composite: XYContainer<SampleDatum>
  intervalId: NodeJS.Timeout
  @ViewChild('chart', { static: false }) chart: ElementRef
  @ViewChild('legendRef', { static: false }) legendRef: ElementRef

  ngAfterViewInit (): void {
    const data: SampleDatum[] = generateData()
    this.areaConfig = getStackedBarConfig(this.yAccessors)

    this.chartConfig = {
      margin: { top: 10, bottom: 10, left: 15, right: 10 },
      components: [
        new StackedBar(this.areaConfig),
      ],
      xAxis: new Axis({
        label: 'Index',
      }),
      yAxis: new Axis({
      }),
      yDirection: Direction.South,
      tooltip: new Tooltip({
        triggers: {
          [StackedBar.selectors.bar]: (d, i) => {
            const accessor = this.yAccessors[i % 5]
            const value = (typeof accessor === 'function') ? accessor(d) : 'No Data'
            return `<span>${value}</span>`
          },
        },
      }),
      crosshair: new Crosshair({
        template: (d) => `<span>Index: ${d.x}</span>`,
      }),
    }

    this.composite = new XYContainer(this.chart.nativeElement, this.chartConfig, data)

    this.intervalId = setInterval(() => {
      this.composite.setData(generateData(20))
    }, 25000)
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
}

function getStackedBarConfig (y: NumericAccessor<SampleDatum>[]): StackedBarConfigInterface<SampleDatum> {
  return {
    orientation: Orientation.Horizontal,
    y: y,
    x: d => d.x,
    roundedCorners: 5,
  }
}
