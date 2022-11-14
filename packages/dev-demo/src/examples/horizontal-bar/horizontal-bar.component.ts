import { AfterViewInit, OnDestroy, Component, ElementRef, ViewChild } from '@angular/core'
import _times from 'lodash-es/times'
import _random from 'lodash-es/random'

// Vis
import {
  XYContainer,
  XYContainerConfigInterface,
  Axis,
  GroupedBarConfigInterface,
  StackedBarConfigInterface,
  Tooltip,
  Crosshair,
  StackedBar,
  Orientation,
  NumericAccessor,
  Direction,
  GroupedBar,
} from '@unovis/ts'

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

  legendItems: {
    name: string;
    inactive?: boolean;
  }[] = this.yAccessors.map((d, i) => ({
      name: `Stream ${i + 1}`,
      hidden: !d,
    }))

  chartConfig: XYContainerConfigInterface<SampleDatum>
  groupedBarChart: XYContainer<SampleDatum>
  stackedBarChart: XYContainer<SampleDatum>
  intervalId: NodeJS.Timeout
  @ViewChild('stacked', { static: false }) stacked: ElementRef
  @ViewChild('grouped', { static: false }) grouped: ElementRef
  @ViewChild('legendRef', { static: false }) legendRef: ElementRef

  tooltip = new Tooltip({
    container: document.body,
    triggers: {
      [StackedBar.selectors.bar]: (d, i) => {
        const accessor = this.yAccessors[i % 5]
        const value = (typeof accessor === 'function') ? accessor(d) : 'No Data'
        return `<span>${value}</span>`
      },
      [GroupedBar.selectors.bar]: (d, i) => {
        const accessor = this.yAccessors[i % 5]
        const value = (typeof accessor === 'function') ? accessor(d) : 'No Data'
        return `<span>${value}</span>`
      },
    },
  })

  ngAfterViewInit (): void {
    const data: SampleDatum[] = generateData()
    const stackedConfig = this.getStackedBarConfig(this.yAccessors)
    const groupConfig = this.getGroupedBarConfig(this.yAccessors)

    this.chartConfig = {
      margin: { top: 10, bottom: 10, left: 15, right: 10 },
      xAxis: new Axis({
        label: 'Index',
      }),
      yAxis: new Axis({}),
      yDirection: Direction.South,
      tooltip: this.tooltip,
    }

    this.stackedBarChart = new XYContainer(this.stacked.nativeElement, {
      ...this.chartConfig,
      components: [
        new StackedBar(stackedConfig),
      ],
      crosshair: new Crosshair({
        template: (d) => `<span>Index: ${d.x}</span>`,
      }),
    }, data)

    this.groupedBarChart = new XYContainer(this.grouped.nativeElement, {
      ...this.chartConfig,
      xAxis: new Axis({}),
      yAxis: new Axis({}),
      height: this.stackedBarChart.containerHeight * 2,
      components: [new GroupedBar(groupConfig)],
    }, data)

    this.intervalId = setInterval(() => {
      const newData = generateData(10);
      [this.groupedBarChart, this.stackedBarChart].forEach((c) => {
        c.setData(newData)
      })
    }, 25000)
  }

  ngOnDestroy (): void {
    clearInterval(this.intervalId)
  }

  onLegendItemClick (event): void {
    const { d } = event
    d.inactive = !d.inactive
    this.legendItems = [...this.legendItems]
    const accessors = this.yAccessors.map((acc, i) =>
      !this.legendItems[i].inactive ? acc : null
    )
    this.stackedBarChart.updateComponents([this.getStackedBarConfig(accessors)])
    this.groupedBarChart.updateComponents([this.getGroupedBarConfig(accessors)])
  }

  getStackedBarConfig (y: NumericAccessor<SampleDatum>[]): StackedBarConfigInterface<SampleDatum> {
    return {
      orientation: Orientation.Horizontal,
      y: y,
      x: d => d.x,
      roundedCorners: 5,
    }
  }

  getGroupedBarConfig (y: NumericAccessor<SampleDatum>[]): GroupedBarConfigInterface<SampleDatum> {
    return {
      orientation: Orientation.Horizontal,
      y: y,
      x: d => d.x,
      roundedCorners: 5,
    }
  }
}
