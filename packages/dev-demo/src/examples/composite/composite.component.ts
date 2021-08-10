// Copyright (c) Volterra, Inc. All rights reserved.
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core'
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
  TextAlign,
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

  legendItems: { name: string; inactive?: boolean }[] = this.yAccessors.map((d, i) => ({ name: `Stream ${i + 1}` }))
  chartConfig: XYContainerConfigInterface<SampleDatum>
  barConfig: StackedBarConfigInterface<SampleDatum>
  lineConfig: LineConfigInterface<SampleDatum>
  composite: XYContainer<SampleDatum>
  navigation: XYContainer<SampleDatum>
  @ViewChild('chart', { static: false }) chartRef: ElementRef
  @ViewChild('navigation', { static: false }) navigationRef: ElementRef
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
        y: {
          domainMaxConstraint: [1, undefined],
        },
        x: {
          domain: undefined,
        },
      },
      axes: {
        x: new Axis({
          // position: 'top',
          label: 'Index',
          // tickValues: [0, 5, 10, 15, 20, 25],
          fullSize: true,
          tickFormat: d => {
            return `${d} long label example`
          },
          tickTextAlign: TextAlign.Left,
          tickTextWidth: 100,
        }),
        y: new Axis({
          // position: 'left',
          label: 'Latency',
          tickFormat: d => {
            return `${d} ms`
          },
          tickTextAlign: TextAlign.Left,
          tickTextWidth: 80,
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

    this.composite = new XYContainer(this.chartRef.nativeElement, this.chartConfig, data)

    const navConfig: XYContainerConfigInterface<SampleDatum> = {
      margin: { left: 9, right: 9 },
      components: [
        new StackedBar(this.lineConfig),
        new Brush({
          onBrush: (s: [number, number]) => {
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
      },
    }

    this.navigation = new XYContainer<SampleDatum>(this.navigationRef.nativeElement, navConfig, data)
  }

  onLegendItemClick (event): void {
    const { d } = event
    d.inactive = !d.inactive
    this.legendItems = [...this.legendItems]
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
      [StackedBar.selectors.bar]: {},
    },
  }
}

function getLineConfig (y): LineConfigInterface<SampleDatum> {
  return {
    x: d => d.x,
    y,
    events: {
      [Line.selectors.line]: {},
    },
  }
}
