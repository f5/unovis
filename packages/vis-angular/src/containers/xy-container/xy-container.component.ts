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
import { XYContainer, XYContainerConfigInterface } from '@volterra/vis'
import { VisXYComponent } from '@src/core'

@Component({
  selector: 'vis-xy-container',
  templateUrl: './xy-container.component.html',
  styleUrls: ['./xy-container.component.css'],
})
export class VisXYContainerComponent implements AfterViewInit, OnDestroy {
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
  chart: XYContainer<Record<string, unknown>>
  config = {}

  ngAfterViewInit (): void {
    this.chart = new XYContainer<Record<string, unknown>>(this.containerRef.nativeElement, this.getConfig(), this.data)
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

  getConfig (): XYContainerConfigInterface<any> {
    const { duration, margin, padding, dimensions, axes, tooltip, crosshair, adaptiveYScale } = this
    const components = this.visComponents.toArray().map(d => d.component)
    return { components, duration, margin, padding, dimensions, axes, tooltip, crosshair, adaptiveYScale }
  }

  ngOnDestroy (): void {
    this.chart?.destroy()
  }
}
