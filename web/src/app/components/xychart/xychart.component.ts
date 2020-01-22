// Copyright (c) Volterra, Inc. All rights reserved.
import { Component, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core'

// Vis
import { XYContainer, XYContainerConfigInterface } from '@volterra/vis/containers'

@Component({
  selector: 'vis-xychart',
  templateUrl: './xychart.component.html',
  styleUrls: ['./xychart.component.css'],
})
export class XYChartComponent implements AfterViewInit {
  @ViewChild('container', { static: false }) containerRef: ElementRef
  @Input() margin = { top: 10, bottom: 10, left: 10, right: 10 }
  @Input() padding = {}
  @Input() components = []
  @Input() componentConfigs = []
  @Input() dimensions = { x: {}, y: {} }
  @Input() axes = {}
  @Input() tooltip
  @Input() data = []
  chart: XYContainer<object>
  config = {}

  ngAfterViewInit (): void {
    this.chart = new XYContainer<object>(this.containerRef.nativeElement, this.getConfig(), this.data)
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

  getConfig (): XYContainerConfigInterface<object> {
    const { margin, padding, components, dimensions, axes, tooltip } = this
    return {
      margin, padding, components, dimensions, axes, tooltip,
    }
  }
}
