import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core'
import {
  XYContainer,
  XYContainerConfigInterface,
  Axis,
  Brush,
  StackedBar,
  StackedBarConfigInterface,
  Tooltip,
  Crosshair,
  TextAlign,
} from '@unovis/ts'

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
  mainStakedBarConfig: StackedBarConfigInterface<SampleDatum>
  navStackedBarConfig: StackedBarConfigInterface<SampleDatum>
  composite: XYContainer<SampleDatum>
  navigation: XYContainer<SampleDatum>
  tooltip = new Tooltip()

  @ViewChild('chart', { static: false }) chartRef: ElementRef
  @ViewChild('navigation', { static: false }) navigationRef: ElementRef
  @ViewChild('legendRef', { static: false }) legendRef: ElementRef

  ngAfterViewInit (): void {
    const data: SampleDatum[] = sampleSeriesData(100)
    this.mainStakedBarConfig = this.getMainStackedBarConfig(this.yAccessors)
    this.navStackedBarConfig = this.getNavStackedBarConfig(this.yAccessors)

    this.chartConfig = {
      margin: { top: 10, bottom: 10, left: 10, right: 10 },
      padding: { left: 20, right: 20 },
      components: [
        new StackedBar(this.mainStakedBarConfig),
      ],
      yDomainMaxConstraint: [1, undefined],
      xAxis: new Axis({
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
      yAxis: new Axis({
        // position: 'left',
        label: 'Latency',
        tickFormat: d => {
          return `${d} ms`
        },
        tickTextAlign: TextAlign.Left,
        tickTextWidth: 80,
      }),
      tooltip: this.tooltip,
      crosshair: new Crosshair({
        template: (d) => '<span>Crosshair</span>',
      }),
    }

    this.composite = new XYContainer(this.chartRef.nativeElement, this.chartConfig, data)

    const navConfig: XYContainerConfigInterface<SampleDatum> = {
      margin: { left: 9, right: 9 },
      components: [
        new StackedBar(this.navStackedBarConfig),
        new Brush<SampleDatum>({
          onBrush: (s: [number, number]) => {
            this.chartConfig.xDomain = s
            this.composite.updateContainer(this.chartConfig, true)
            this.composite.render(0)
          },
        }),
      ],
      xAxis: new Axis(),
    }

    this.navigation = new XYContainer<SampleDatum>(this.navigationRef.nativeElement, navConfig, data)

    // Tooltip
    this.tooltip.setConfig({
      container: document.body,
      triggers: {
        [StackedBar.selectors.bar]: (d) => '<span>Bar Chart</span>',
      },
      attributes: {
        type: 'stacked-bar-tooltip',
      },
    })
  }

  onLegendItemClick (event): void {
    const { d } = event
    d.inactive = !d.inactive
    this.legendItems = [...this.legendItems]
    const accessors = this.yAccessors.map((acc, i) => !this.legendItems[i].inactive ? acc : null)
    this.mainStakedBarConfig.y = accessors
    this.composite.updateComponents([this.mainStakedBarConfig])
  }

  getMainStackedBarConfig (y): StackedBarConfigInterface<SampleDatum> {
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

  getNavStackedBarConfig (y): StackedBarConfigInterface<SampleDatum> {
    return {
      x: d => d.x,
      y,
      events: {
        [StackedBar.selectors.bar]: {},
      },
    }
  }
}
