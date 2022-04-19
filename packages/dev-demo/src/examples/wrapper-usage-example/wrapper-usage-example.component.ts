import { AfterViewInit, OnDestroy, Component } from '@angular/core'
import { format } from 'date-fns'

// Vis
import { Axis, Brush, GroupedBar, Tooltip, Crosshair, Scale } from '@volterra/vis'

// Helpers
import { sampleSeriesData, SampleDatum } from '../../utils/data'

@Component({
  selector: 'wrapper-usage-example',
  templateUrl: './wrapper-usage-example.component.html',
  styleUrls: ['./wrapper-usage-example.component.css'],
})

export class WrapperUsageExampleComponent implements AfterViewInit, OnDestroy {
  title = 'wrapper-usage-example'

  // Data
  data: SampleDatum[] = sampleSeriesData(100)

  // Chart configuration
  duration = undefined
  groupedBarConfig = {
    x: d => d.timestamp,
    y: [
      d => d.y,
      d => d.y1,
    ],
    id: d => d.index,
    barMaxWidth: 8,
    roundedCorners: 2,
    events: {
      [GroupedBar.selectors.bar]: {
        // click: d => {},
      },
    },
  }

  groupedBar = new GroupedBar<SampleDatum>(this.groupedBarConfig)

  components = [this.groupedBar]

  margin = { top: 10, bottom: 10, left: 10, right: 10 }
  padding = {}

  xDomain = undefined
  xScale = Scale.scaleTime()

  xAxis = new Axis({
    label: 'x axis',
    numTicks: 10,
    tickFormat: (tick, i, ticks) => {
      const currentDate = new Date(tick)
      const prevDate: Date | undefined = ticks[i - 1] && new Date(ticks[i - 1])
      const currentDay = currentDate.getDate()
      const prevDay = prevDate?.getDate()
      return format(currentDate, prevDay !== currentDay ? 'h:mm aaa MMM d' : 'h:mm aaa')
    },
    tickTextWidth: 60,
  })

  yAxis = new Axis({ label: 'y axis' })

  tooltip = new Tooltip({
    triggers: {
      // eslint-disable-next-line no-console
      // [GroupedBar.selectors.bar]: (d) => { console.log(d); return '' },
    },
  })

  crosshair = new Crosshair<SampleDatum>({
    template: (d) => `
      <div>X: ${d.x}</div>
      <div>Value 1: ${d.y.toFixed(2)}</div>
      <div>Value 2: ${d.y1.toFixed(2)}</div>
    `,
  })

  // Navigation
  navComponents = [
    new GroupedBar<SampleDatum>(this.groupedBarConfig),
    new Brush({
      selectionMinLength: 5,
      draggable: true,
      onBrush: (s: [number, number]) => {
        this.duration = 0
        this.xDomain = s
      },
    }),
  ]

  navAxes = {
    x: new Axis({
      label: 'x axis',
      tickFormat: d => (new Date(d)).toTimeString(),
      tickTextWidth: 120,
    }),
    y: new Axis({ label: 'y axis' }),
  }

  intervalId: NodeJS.Timeout

  ngAfterViewInit (): void {
    this.intervalId = setInterval(() => {
      this.duration = undefined
      this.data = sampleSeriesData(Math.floor(10 + 50 * Math.random()))
      this.groupedBarConfig.barMaxWidth = Math.random() * 20
      this.groupedBarConfig = { ...this.groupedBarConfig } // Updating the object to trigger change detection
    }, 15000)
  }

  ngOnDestroy (): void {
    clearInterval(this.intervalId)
  }

  x (d): number {
    return d.timestamp
  }

  y (d): number {
    return d.y
  }
}
