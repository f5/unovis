// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core'
// Vis
import {
  XYContainer,
  XYContainerConfigInterface,
  Axis,
  Brush,
  Line,
  LineConfigInterface,
  StackedBar,
  StackedBarConfigInterface,
  Tooltip,
  Crosshair,
} from '@volterra/vis'

// Helpers
import { sampleSeriesData, SampleDatum } from '../../utils/data'

@Component({
  selector: 'composite',
  templateUrl: './composite.component.html',
  styleUrls: ['./composite.component.css'],
})

export class CompositeComponent implements AfterViewInit {
  title = 'composite'
  yAccessors = [
    d => d.y,
    d => d.y1,
    d => d.y2,
    d => d.y3,
    d => d.y4,
  ]
  legendItems: { name: string, inactive?: boolean }[] = this.yAccessors.map((d, i) => ({ name: `Stream ${i + 1}` }))
  chartConfig: XYContainerConfigInterface<SampleDatum>
  barConfig: StackedBarConfigInterface<SampleDatum>
  lineConfig: LineConfigInterface<SampleDatum>
  composite: XYContainer<SampleDatum>
  @ViewChild('chart', { static: false }) chart: ElementRef
  @ViewChild('navigation', { static: false }) navigation: ElementRef
  @ViewChild('legendRef', { static: false }) legendRef: ElementRef


  ngAfterViewInit (): void {
    const data: SampleDatum[] = sampleSeriesData(100)
    this.barConfig = getBarConfig(this.yAccessors)
    this.lineConfig = getLineConfig(this.yAccessors)

    this.chartConfig = {
      margin: { top: 10, bottom: 10, left: 10, right: 10 },
      padding: { left: 20, right: 20 },
      components: [
        new StackedBar(this.barConfig),
      ],
      dimensions: {
        x: {
          domain: undefined
        }
      },
      axes: {
        x: new Axis({
          // position: 'top',
          label: 'Index',
          // tickValues: [0, 5, 10, 15, 20, 25],
          fullSize: true
        }),
        y: new Axis({
          // position: 'left',
          label: 'Latency',
          tickFormat: d => {
            return `${d} ms`
          },
        }),
      },
      tooltip: new Tooltip({
        triggers: {
          [StackedBar.selectors.bar]: (d) => '<span>Bar Chart</span>',
        },
      }),
      crosshair: new Crosshair({
        template: (d) => '<span>Crosshair</span>',
      }),
    }

    this.composite = new XYContainer(this.chart.nativeElement, this.chartConfig, data)

    const navConfig = {
      margin: { left: 9, right: 9 },
      components: [
        new StackedBar(this.lineConfig),
        new Brush({
          onBrush: (s) => {
            this.chartConfig.dimensions.x.domain = s
            this.composite.updateContainer(this.chartConfig, true)
            this.composite.render(0)
          },
        }),
      ],
      dimensions: {
      },
      axes: {
        x: new Axis(),
      }
    }

    // @ts-ignore
    const nav = new XYContainer(this.navigation.nativeElement, navConfig, data)
  }

  onLegendItemClick (event): void {
    const { d } = event
    d.inactive = !d.inactive
    this.legendItems = [ ...this.legendItems ]
    const accessors = this.yAccessors.map((acc, i) => !this.legendItems[i].inactive ? acc : null)
    this.barConfig.y = accessors
    this.composite.updateComponents([this.barConfig])
  }
}

function getBarConfig (y): StackedBarConfigInterface<SampleDatum> {
  return {
    x: d => d.x,
    y,
    barMaxWidth: 15,
    roundedCorners: false,
    events: {
      [StackedBar.selectors.bar]: {
        click: d => { },
      },
    },
  }
}

function getLineConfig (y): LineConfigInterface<SampleDatum> {
  return {
    // barMaxWidth: 15,
    x: d => d.x,
    y,
    events: {
      [Line.selectors.line]: {
        click: d => { },
      },
    },
  }
}
