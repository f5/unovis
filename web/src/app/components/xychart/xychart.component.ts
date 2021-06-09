// Copyright (c) Volterra, Inc. All rights reserved.
import { Component, ViewChild, ElementRef, AfterViewInit, Input, OnDestroy } from '@angular/core'

// Vis
import { XYContainer, XYContainerConfigInterface } from '@volterra/vis'
import { Dimension } from 'types/misc'

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
  @Input() dimensions: Record<string, Dimension> = { x: {}, y: {} }
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
    const { duration, margin, padding, components, dimensions, axes, tooltip, crosshair, adaptiveYScale } = this
    return {
      duration, margin, padding, components, dimensions, axes, tooltip, crosshair, adaptiveYScale,
    }
  }

  ngOnDestroy (): void {
    this.chart.destroy()
  }
}
