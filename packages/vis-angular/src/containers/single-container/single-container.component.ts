// Copyright (c) Volterra, Inc. All rights reserved.
import { Component, ContentChildren, ViewChild, ElementRef, AfterViewInit, Input, OnDestroy, QueryList, SimpleChanges } from '@angular/core'

// Vis
import { SingleChart, SingleChartConfigInterface, Axis, Crosshair, Tooltip } from '@volterra/vis'
import { VisCoreComponent } from '../../core'

@Component({
  selector: 'vis-single-container',
  template: `<div #container class="container">
    <ng-content></ng-content>
  </div>`,
  styles: ['.container { width: 100%; height: 100%; position: relative; }'],
})
export class VisSingleContainerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: false }) containerRef: ElementRef
  @ContentChildren(VisCoreComponent) visComponents: QueryList<VisCoreComponent>
  @Input() margin = { top: 10, bottom: 10, left: 10, right: 10 }
  @Input() duration: number
  @Input() data
  chart: SingleChart<unknown>

  ngAfterViewInit (): void {
    this.chart = new SingleChart<unknown>(this.containerRef.nativeElement, this.getConfig(), this.data)
  }

  ngOnChanges (changes: SimpleChanges): void {
    // Set new Data without re-render
    if (changes.data) {
      this.chart?.setData(this.data, true)
      delete changes.data
    }

    // Update Container and render
    this.chart?.updateContainer(this.getConfig())
  }

  getConfig (): SingleChartConfigInterface<unknown> {
    const { duration, margin } = this
    const visComponents = this.visComponents.toArray().map(d => d.component)
    const tooltip = visComponents.find(c => c instanceof Tooltip) as unknown as Tooltip<any, unknown>
    const component = visComponents.find(c => !(c instanceof Crosshair) && !(c instanceof Tooltip) && !(c instanceof Axis))

    return { duration, margin, component, tooltip }
  }

  ngOnDestroy (): void {
    this.chart.destroy()
  }
}
