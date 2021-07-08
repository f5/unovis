// Copyright (c) Volterra, Inc. All rights reserved.
import {
  Component,
  ViewChild,
  ContentChildren,
  ElementRef,
  AfterViewInit,
  Input,
  OnDestroy,
  QueryList,
  SimpleChanges,
} from '@angular/core'

// Vis
import { XYComponentCore, XYContainer, XYContainerConfigInterface, Axis, Crosshair, Tooltip } from '@volterra/vis'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-xy-container',
  templateUrl: './xy-container.component.html',
  styleUrls: ['./xy-container.component.css'],
})
export class VisXYContainerComponent<Datum = Record<string, unknown>> implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: false }) containerRef: ElementRef
  @ContentChildren(VisXYComponent) visComponents: QueryList<VisXYComponent>
  @Input() duration = undefined
  @Input() margin = { top: 10, bottom: 10, left: 10, right: 10 }
  @Input() padding = {}
  @Input() dimensions = { x: {}, y: {} }
  @Input() axes = {}
  @Input() tooltip
  @Input() crosshair
  @Input() adaptiveYScale
  @Input() data = []
  chart: XYContainer<Datum>
  config = {}

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

    // Update Container properties
    Object.keys(changes).forEach(key => {
      this[key] = changes[key].currentValue
    })

    // Update Container and render
    this.chart?.updateContainer(this.getConfig())
  }

  getConfig (): XYContainerConfigInterface<Datum> {
    const { duration, margin, padding, dimensions, adaptiveYScale } = this
    const visComponents = this.visComponents.toArray().map(d => d.component)

    const crosshair = visComponents.find(c => c instanceof Crosshair) as Crosshair<Datum>
    const tooltip = visComponents.find(c => c instanceof Tooltip) as unknown as Tooltip<XYComponentCore<Datum>, Datum>

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
