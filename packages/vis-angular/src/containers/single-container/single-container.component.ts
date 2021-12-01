// Copyright (c) Volterra, Inc. All rights reserved.
import { Component, ViewChild, ElementRef, AfterViewInit, Input, OnDestroy, SimpleChanges, ContentChild } from '@angular/core'

// Vis
import { ComponentCore, SingleChart, SingleChartConfigInterface, Tooltip } from '@volterra/vis'
import { VisCoreComponent } from '../../core'
import { VisTooltipComponent } from '../../components/tooltip/tooltip.component'

@Component({
  selector: 'vis-single-container',
  template: `<div #container class="container">
    <ng-content></ng-content>
  </div>`,
  styles: ['.container { width: 100%; height: 100%; position: relative; }'],
})
export class VisSingleContainerComponent<Data = unknown, C extends ComponentCore<Data> = ComponentCore<Data>> implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: false }) containerRef: ElementRef
  @ContentChild(VisCoreComponent) visComponent: VisCoreComponent
  @ContentChild(VisTooltipComponent) tooltipComponent: VisTooltipComponent

  /** Margins. Default: `{ top: 0, bottom: 0, left: 0, right: 0 }` */
  @Input() margin = { top: 10, bottom: 10, left: 10, right: 10 }
  /** Animation duration of all the components within the container. Default: `undefined` */
  @Input() duration: number
  @Input() data

  chart: SingleChart<Data>

  ngAfterViewInit (): void {
    this.chart = new SingleChart<Data>(this.containerRef.nativeElement, this.getConfig(), this.data)
    // We pass the container for the component to trigger re-render if the data has changed
    this.visComponent.componentContainer = this.chart
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

  getConfig (): SingleChartConfigInterface<Data> {
    const { duration, margin } = this

    const component = this.visComponent?.component as C
    const tooltip = this.tooltipComponent?.component as Tooltip

    return { duration, margin, component, tooltip }
  }

  ngOnDestroy (): void {
    this.chart.destroy()
  }
}
