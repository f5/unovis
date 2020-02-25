// Copyright (c) Volterra, Inc. All rights reserved.
import { Component, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core'

// Vis
import { SingleChart, SingleChartConfigInterface } from '@volterra/vis'

@Component({
  selector: 'vis-singlechart',
  templateUrl: './singlechart.component.html',
  styleUrls: ['./singlechart.component.css'],
})
export class SingleChartComponent implements AfterViewInit {
  @ViewChild('container', { static: false }) containerRef: ElementRef
  @Input() margin = { top: 10, bottom: 10, left: 10, right: 10 }
  @Input() component
  @Input() config = {}
  @Input() data = []
  chart: SingleChart<object>

  ngAfterViewInit (): void {
    this.chart = new SingleChart<object>(this.containerRef.nativeElement, { component: this.component }, this.data)
  }

  ngOnChanges (changes): void {
    const preventRender = true

    // Set new Data without re-render
    if (changes.data) {
      this.chart?.setData(this.data, preventRender)
      delete changes.data
    }

    // Update Component configs without re-render
    if (changes.config) {
      this.chart?.updateComponent(this.config, preventRender)
    }

    // Update Container properties
    Object.keys(changes).forEach(key => {
      this[key] = changes[key].currentValue
    })

    // Update Container and render
    this.chart?.updateContainer(this.getConfig())
  }

  getConfig (): SingleChartConfigInterface<object> {
    const { margin, component } = this
    return { margin, component }
  }
}
