// Copyright (c) Volterra, Inc. All rights reserved.
import {
  Component,
  ViewChild,
  ContentChildren,
  ContentChild,
  ElementRef,
  AfterViewInit,
  Input,
  OnDestroy,
  QueryList,
  SimpleChanges,
} from '@angular/core'

// Vis
import { XYComponentCore, XYContainer, XYContainerConfigInterface, Axis, Crosshair, Tooltip, Dimension } from '@volterra/vis'
import { VisXYComponent } from '../../core'
import { VisTooltipComponent } from '../../core/tooltip/tooltip.directive'

@Component({
  selector: 'vis-xy-container',
  template: `<div #container class="container">
    <ng-content></ng-content>
  </div>`,
  styles: ['.container { width: 100%; height: 100%; position: relative; }'],
})
export class VisXYContainerComponent<Datum = Record<string, unknown>> implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: false }) containerRef: ElementRef
  @ContentChildren(VisXYComponent) visComponents: QueryList<VisXYComponent>
  @ContentChild(VisTooltipComponent) tooltipComponent: VisTooltipComponent
  @Input() duration: number = undefined
  @Input() margin = { top: 10, bottom: 10, left: 10, right: 10 }
  @Input() padding = {}
  @Input() dimensions: { x: Dimension; y: Dimension } = { x: {}, y: {} }
  @Input() adaptiveYScale
  @Input() data: Datum[] = []
  chart: XYContainer<Datum>

  ngAfterViewInit (): void {
    this.chart = new XYContainer<Datum>(this.containerRef.nativeElement, this.getConfig(), this.data)
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
    const { duration, margin, padding, dimensions, adaptiveYScale } = this
    const visComponents = this.visComponents.toArray().map(d => d.component)

    const crosshair = visComponents.find(c => c instanceof Crosshair) as Crosshair<Datum>
    const tooltip = this.tooltipComponent?.component as Tooltip<XYComponentCore<Datum>, Datum>
    const xAxis = visComponents.find(c => c instanceof Axis && c?.config?.type === 'x') as Axis<Datum>
    const yAxis = visComponents.find(c => c instanceof Axis && c?.config?.type === 'y') as Axis<Datum>
    const axes: {x?: Axis<Datum>; y?: Axis<Datum>} = {}
    if (xAxis) axes.x = xAxis
    if (yAxis) axes.y = yAxis

    const components = visComponents.filter(c => !(c instanceof Crosshair) && !(c instanceof Tooltip) && !(c instanceof Axis))

    return { components, duration, margin, padding, dimensions, axes, tooltip, crosshair, adaptiveYScale }
  }

  ngOnDestroy (): void {
    this.chart?.destroy()
  }
}
