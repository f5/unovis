import { Component, ViewChild, ElementRef, AfterViewInit, Input, OnDestroy, SimpleChanges, ContentChild } from '@angular/core'

// Vis
import { ComponentCore, SingleContainer, SingleContainerConfigInterface, Tooltip, Spacing, Annotations, Sizing } from '@unovis/ts'
import { VisCoreComponent } from '../../core'
import { VisTooltipComponent } from '../../components/tooltip/tooltip.component'
import { VisAnnotationsComponent } from '../../components/annotations/annotations.component'

@Component({
  selector: 'vis-single-container',
  template: `<div #container class="unovis-single-container">
    <ng-content></ng-content>
  </div>`,
  styles: ['.unovis-single-container { width: 100%; height: 100%; position: relative; }'],
})
export class VisSingleContainerComponent<Data = unknown, C extends ComponentCore<Data> = ComponentCore<Data>> implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: false }) containerRef: ElementRef
  @ContentChild(VisCoreComponent) visComponent: VisCoreComponent
  @ContentChild(VisTooltipComponent) tooltipComponent: VisTooltipComponent
  @ContentChild(VisAnnotationsComponent) annotationsComponent: VisAnnotationsComponent

  /** Width in pixels. By default, Container automatically fits to the size of the parent element. Default: `undefined`. */
  @Input() width?: number
  /** Height in pixels. By default, Container automatically fits to the size of the parent element. Default: `undefined`. */
  @Input() height?: number

  /** Margins. Default: `{ top: 0, bottom: 0, left: 0, right: 0 }` */
  @Input() margin?: Spacing = { top: 0, bottom: 0, left: 0, right: 0 }
  /** Animation duration of all the components within the container. Default: `undefined` */
  @Input() duration?: number
  /** Alternative text description of the chart for accessibility purposes. It will be applied as an
   * `aria-label` attribute to the div element containing your chart. Default: `undefined`.
  */
  @Input() ariaLabel?: string | null | undefined
  /** Custom SVG defs available to all the components within the container. Default: `undefined`. */
  @Input() svgDefs?: string
  /** Defines whether components should fit into the container or the container should expand to fit to the component's size.
   * Works with a limited set of components. Default: `Sizing.Fit` */
  @Input() sizing?: Sizing | string
  /** Data to be passed to the component. Default: `undefined`. */
  @Input() data?: Data

  chart: SingleContainer<Data>

  ngAfterViewInit (): void {
    this.chart = new SingleContainer<Data>(this.containerRef.nativeElement, this.getConfig(), this.data)
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

  getConfig (): SingleContainerConfigInterface<Data> {
    const { width, height, duration, margin, ariaLabel, svgDefs, sizing } = this

    const component = this.visComponent?.component as C
    const tooltip = this.tooltipComponent?.component as Tooltip
    const annotations = this.annotationsComponent?.component as Annotations

    return { width, height, duration, margin, component, tooltip, ariaLabel, annotations, svgDefs, sizing }
  }

  ngOnDestroy (): void {
    this.chart.destroy()
  }
}
