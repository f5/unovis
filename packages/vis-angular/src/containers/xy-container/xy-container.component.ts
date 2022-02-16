// Copyright (c) Volterra, Inc. All rights reserved.
import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  Input,
  OnDestroy,
  QueryList,
  SimpleChanges,
  ViewChild,
} from '@angular/core'

// Vis
import { Axis, ContinuousScale, Crosshair, Direction, Spacing, Tooltip, XYContainer, XYContainerConfigInterface } from '@volterra/vis'
import { VisXYComponent } from '../../core'
import { VisTooltipComponent } from '../../components/tooltip/tooltip.component'

@Component({
  selector: 'vis-xy-container',
  template: `<div #container class="container">
    <ng-content></ng-content>
  </div>`,
  styles: ['.container { width: 100%; height: 100%; position: relative; }'],
})
export class VisXYContainerComponent<Datum> implements AfterViewInit, AfterContentInit, OnDestroy {
  @ViewChild('container', { static: false }) containerRef: ElementRef
  @ContentChildren(VisXYComponent) visComponents: QueryList<VisXYComponent>
  @ContentChild(VisTooltipComponent) tooltipComponent: VisTooltipComponent

  /** Scale for X dimension, e.g. Scale.scaleLinear(). Default: `Scale.scaleLinear()` */
  @Input() xScale: ContinuousScale;
  /** Scale domain (data extent) for X dimension. By default this value is calculated automatically based on data. */
  @Input() xDomain: [number | undefined, number | undefined];
  /** Constraint the minimum value of the X scale domain. Useful when the data is plotted along the X axis.
   * For example, imagine that you have a chart with dynamic data that has negative values. When values are small
   * (let's say in the range of [-0.01, 0]), you might still want the chart to display some meaningful value range (e.g. [-1, 0]). That can
   * be achieved by setting `xDomainMinConstraint` to `[undefined, -1]`. In addition to that, if you want to cut off the
   * values that are too low (let's say lower than -100), you can set the constraint to `[-100, -1]`
   * Default: `undefined` */
  @Input() xDomainMinConstraint: [number | undefined, number | undefined];
  /** Constraint the minimum value of the X scale domain. Useful when the data is plotted along the X axis.
   * For example, imagine that you have a chart with dynamic data. When values are small
   * (let's say < 0.01), you might still want the chart to display some meaningful value range (e.g. [0, 1]). That can
   * be achieved by setting `xDomainMaxConstraint` to `[1, undefined]`. In addition to that, if you want to cut off the
   * values that are too high (let's say higher than 100), you can set the constraint to `[1, 100]`
   * Default: `undefined` */
  @Input() xDomainMaxConstraint: [number | undefined, number | undefined];
  /** Force set the X scale range (in the screen space). By default the range is calculated automatically based on the
   * chart's set up */
  @Input() xRange: [number, number];

  /** Scale for Y dimension, e.g. Scale.ScaleLinear. Default: `Scale.ScaleLinear()` */
  @Input() yScale: ContinuousScale;
  /** Scale domain (data extent) for Y dimension. By default this value is calculated automatically based on data. */
  @Input() yDomain: [number | undefined, number | undefined];
  /** Constraint the minimum value of the Y scale domain.
   * For example, imagine that you have a chart with dynamic data that has negative values. When values are small
   * (let's say in the range of [-0.01, 0]), you might still want the chart to display some meaningful value range (e.g. [-1, 0]). That can
   * be achieved by setting `yDomainMinConstraint` to `[undefined, -1]`. In addition to that, if you want to cut off the
   * values that are too low (let's say lower than -100), you can set the constraint to `[-100, -1]`
   * Default: `undefined` */
  @Input() yDomainMinConstraint: [number | undefined, number | undefined] = undefined;
  /** Constraint the minimum value of the Y scale domain.
   * For example, imagine that you have a chart with dynamic data. When values are small
   * (let's say < 0.01), you might still want the chart to display some meaningful value range (e.g. [0, 1]). That can
   * be achieved by setting `yDomainMaxConstraint` to `[1, undefined]`. In addition to that, if you want to cut off the
   * values that are too high (let's say higher than 100), you can set the constraint to `[1, 100]`
   * Default: `undefined` */
  @Input() yDomainMaxConstraint: [number | undefined, number | undefined];
  /** Force set the Y scale range (in the screen space). By default the range is calculated automatically based on the
   * chart's set up */
  @Input() yRange: [number, number];
  /** Y Axis direction. Default: `Direction.North` */
  @Input() yDirection: Direction.South | Direction.North | string = Direction.North;

  /** Animation duration of all the components within the container. Default: `undefined` */
  @Input() duration: number = undefined
  /** Margins. Default: `{ top: 0, bottom: 0, left: 0, right: 0 }` */
  @Input() margin: Spacing = { top: 10, bottom: 10, left: 10, right: 10 }
  /** Padding. Default: `{ top: 0, bottom: 0, left: 0, right: 0 }` */
  @Input() padding: Spacing = {}
  /** Sets the Y scale domain based on the current X scale domain (not the whole dataset). Default: `false` */
  @Input() scaleByDomain: boolean
  /** Enables automatic calculation of chart margins based on the size of the axes. Default: `true` */
  @Input() autoMargin?: boolean = true;

  /** Data to be passed to all child components. But if `data` is `undefined` it'll to be passed allowing components to
   * have their individual data. Default: `undefined` */
  @Input() data: Datum[] | undefined = undefined

  chart: XYContainer<Datum>

  ngAfterViewInit (): void {
    this.chart = new XYContainer<Datum>(this.containerRef.nativeElement, this.getConfig(), this.data)
    this.passContainerReferenceToChildren()
  }

  ngAfterContentInit (): void {
    // QueryList does unsubscribe automatically when it gets destroyed
    this.visComponents.changes.subscribe(() => {
      this.passContainerReferenceToChildren()
      this.chart?.updateContainer(this.getConfig())
    })
  }

  ngOnChanges (changes: SimpleChanges): void {
    const preventRender = true

    // Set new Data without re-render
    if (changes.data) {
      this.chart?.setData(this.data, preventRender)
      delete changes.data
    }

    // Update Container and render
    this.chart?.updateContainer(this.getConfig())
  }

  getConfig (): XYContainerConfigInterface<Datum> {
    const {
      duration, margin, padding, scaleByDomain, autoMargin,
      xScale, xDomain, xDomainMinConstraint, xDomainMaxConstraint, xRange,
      yScale, yDomain, yDomainMinConstraint, yDomainMaxConstraint, yRange, yDirection,
    } = this
    const visComponents = this.visComponents.toArray().map(d => d.component)

    const crosshair = visComponents.find(c => c instanceof Crosshair) as Crosshair<Datum>
    const tooltip = this.tooltipComponent?.component as Tooltip
    const xAxis = visComponents.find(c => c instanceof Axis && c?.config?.type === 'x') as Axis<Datum>
    const yAxis = visComponents.find(c => c instanceof Axis && c?.config?.type === 'y') as Axis<Datum>

    const components = visComponents.filter(c => !(c instanceof Crosshair) && !(c instanceof Tooltip) && !(c instanceof Axis))

    return {
      components,
      duration,
      margin,
      padding,
      xAxis,
      yAxis,
      tooltip,
      crosshair,
      scaleByDomain,
      autoMargin,
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
      yDirection,
    }
  }

  passContainerReferenceToChildren (): void {
    // We set the container for each vis component to trigger chart re-render if the data has changed
    if (this.chart) this.visComponents.toArray().forEach(c => { c.componentContainer = this.chart })
  }

  ngOnDestroy (): void {
    this.chart?.destroy()
  }
}
