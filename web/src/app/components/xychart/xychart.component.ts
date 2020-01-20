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
  @Input() dimensions = { x: {}, y: {} }
  @Input() axes = {}
  @Input() tooltip
  @Input() data = []
  @Input() class
  chart: XYContainer
  config = {}

  ngAfterViewInit (): void {
    this.chart = new XYContainer(this.containerRef.nativeElement, this.getConfig(), this.data)
  }

  ngOnChanges (changes): void {
    // Set new data without re-render if passed
    if (changes.data) {
      this.chart?.setData(this.data, false)
      delete changes.data
    }

    // Update properties
    Object.keys(changes).forEach(key => {
      this[key] = changes[key].currentValue
    })

    // Update Chart
    this.chart?.updateContainer(this.getConfig())
  }

  getConfig (): XYContainerConfigInterface {
    const { margin, padding, components, dimensions, axes, tooltip } = this
    return {
      margin, padding, components, dimensions, axes, tooltip,
    }
  }
}
