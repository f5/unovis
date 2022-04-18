import { Component, ViewChild, ElementRef, AfterViewInit, Input, OnDestroy } from '@angular/core'

// Vis
import { SingleChart, SingleChartConfigInterface } from '@volterra/vis'

@Component({
  selector: 'vis-singlechart',
  templateUrl: './singlechart.component.html',
  styleUrls: ['./singlechart.component.css'],
})
export class SingleChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: false }) containerRef: ElementRef
  @Input() margin = { top: 10, bottom: 10, left: 10, right: 10 }
  @Input() component
  @Input() config = {}
  @Input() data = []
  @Input() tooltip
  chart: SingleChart<unknown>

  ngAfterViewInit (): void {
    this.chart = new SingleChart<unknown>(this.containerRef.nativeElement, this.getConfig(), this.data)
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

  getConfig (): SingleChartConfigInterface<unknown> {
    const { margin, component, tooltip } = this
    return { margin, component, tooltip }
  }

  ngOnDestroy (): void {
    this.chart.destroy()
  }
}
