import { Component, ViewChild, ElementRef, AfterViewInit, Input, OnDestroy } from '@angular/core'

// Vis
import { ContinuousScale, XYContainer, XYContainerConfigInterface } from '@volterra/vis'

@Component({
  selector: 'vis-xychart',
  templateUrl: './xychart.component.html',
  styleUrls: ['./xychart.component.css'],
})
export class XYChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: false }) containerRef: ElementRef
  @Input() duration = undefined
  @Input() margin = { top: 10, bottom: 10, left: 10, right: 10 }
  @Input() padding = {}
  @Input() components = []
  @Input() componentConfigs = []
  @Input() xAxis
  @Input() yAxis
  @Input() tooltip
  @Input() crosshair
  @Input() scaleByDomain

  /** Scale for X dimension, e.g. Scale.scaleLinear(). Default: `Scale.scaleLinear()` */
  @Input() xScale?: ContinuousScale;
  /** Scale domain (data extent) for X dimension. By default this value is calculated automatically based on data. */
  @Input() xDomain?: [number | undefined, number | undefined];
  /** Constraint the minimum value of the X scale domain. Useful when the data is plotted along the X axis.
   * For example, imagine that you have a chart with dynamic data that has negative values. When values are small
   * (let's say in the range of [-0.01, 0]), you might still want the chart to display some meaningful value range (e.g. [-1, 0]). That can
   * be achieved by setting `xDomainMinConstraint` to `[undefined, -1]`. In addition to that, if you want to cut off the
   * values that are too low (let's say lower than -100), you can set the constraint to `[-100, -1]`
   * Default: `undefined` */
  @Input() xDomainMinConstraint?: [number | undefined, number | undefined];
  /** Constraint the minimum value of the X scale domain. Useful when the data is plotted along the X axis.
   * For example, imagine that you have a chart with dynamic data. When values are small
   * (let's say < 0.01), you might still want the chart to display some meaningful value range (e.g. [0, 1]). That can
   * be achieved by setting `xDomainMaxConstraint` to `[1, undefined]`. In addition to that, if you want to cut off the
   * values that are too high (let's say higher than 100), you can set the constraint to `[1, 100]`
   * Default: `undefined` */
  @Input() xDomainMaxConstraint?: [number | undefined, number | undefined];
  /** Force set the X scale range (in the screen space). By default the range is calculated automatically based on the
   * chart's set up */
  @Input() xRange?: [number, number];

  /** Scale for Y dimension, e.g. Scale.ScaleLinear. Default: `Scale.ScaleLinear()` */
  @Input() yScale?: ContinuousScale;
  /** Scale domain (data extent) for Y dimension. By default this value is calculated automatically based on data. */
  @Input() yDomain?: [number | undefined, number | undefined];
  /** Constraint the minimum value of the Y scale domain.
   * For example, imagine that you have a chart with dynamic data that has negative values. When values are small
   * (let's say in the range of [-0.01, 0]), you might still want the chart to display some meaningful value range (e.g. [-1, 0]). That can
   * be achieved by setting `yDomainMinConstraint` to `[undefined, -1]`. In addition to that, if you want to cut off the
   * values that are too low (let's say lower than -100), you can set the constraint to `[-100, -1]`
   * Default: `undefined` */
  @Input() yDomainMinConstraint?: [number | undefined, number | undefined];
  /** Constraint the minimum value of the Y scale domain.
   * For example, imagine that you have a chart with dynamic data. When values are small
   * (let's say < 0.01), you might still want the chart to display some meaningful value range (e.g. [0, 1]). That can
   * be achieved by setting `yDomainMaxConstraint` to `[1, undefined]`. In addition to that, if you want to cut off the
   * values that are too high (let's say higher than 100), you can set the constraint to `[1, 100]`
   * Default: `undefined` */
  @Input() yDomainMaxConstraint?: [number | undefined, number | undefined];
  /** Force set the Y scale range (in the screen space). By default the range is calculated automatically based on the
   * chart's set up */
  @Input() yRange?: [number, number];

  @Input() data: any[] = []
  chart: XYContainer<Record<string, unknown>>
  config = {}

  ngAfterViewInit (): void {
    this.chart = new XYContainer<Record<string, unknown>>(this.containerRef.nativeElement, this.getConfig(), this.data)
  }

  ngOnChanges (changes): void {
    const preventRender = true

    // Set new Data without re-render
    if (changes.data) {
      this.chart?.setData(this.data, preventRender)
      delete changes.data
    }

    // Update Component configs without re-render
    if (changes.componentConfigs) {
      this.chart?.updateComponents(this.componentConfigs, preventRender)
    }

    // Update Container properties
    Object.keys(changes).forEach(key => {
      this[key] = changes[key].currentValue
    })

    // Update Container and render
    this.chart?.updateContainer(this.getConfig())
  }

  getConfig (): XYContainerConfigInterface<Record<string, unknown>> {
    const {
      duration, margin, padding, components, xAxis, yAxis, tooltip, crosshair, scaleByDomain,
      xScale, xDomain, xDomainMinConstraint, xDomainMaxConstraint, xRange,
      yScale, yDomain, yDomainMinConstraint, yDomainMaxConstraint, yRange,
    } = this

    return {
      duration,
      margin,
      padding,
      components,
      xAxis,
      yAxis,
      tooltip,
      crosshair,
      scaleByDomain,
      xScale,
      xDomain,
      xDomainMinConstraint,
      xDomainMaxConstraint,
      xRange,
      yScale,
      yDomain,
      yDomainMinConstraint,
      yDomainMaxConstraint,
      yRange,
    }
  }

  ngOnDestroy (): void {
    this.chart.destroy()
  }
}
