// Copyright (c) Volterra, Inc. All rights reserved.
import { Component, ViewChild } from '@angular/core'
import { VisCrosshairComponent, VisTooltipComponent } from '@volterra/vis-angular'

// Helpers
import { sampleSeriesData, SampleDatum } from '../../utils/data'

@Component({
  selector: 'atomic-angular-wrapper',
  templateUrl: './atomic-angular-wrapper.component.html',
  styleUrls: ['./atomic-angular-wrapper.component.css'],
})

export class AtomicAngularWrapperComponent {
  @ViewChild(VisCrosshairComponent, { static: false }) crosshairRef: VisCrosshairComponent<SampleDatum>
  @ViewChild(VisTooltipComponent, { static: false }) tooltipRef: VisTooltipComponent

  title = 'atomic-angular-wrapper'

  // Data
  data: SampleDatum[] = sampleSeriesData(100)
  margin = { top: 10, bottom: 10, left: 10, right: 10 }
  padding = {}
  palette = ['#9874f8', '#ffb541']
  crosshairTemplate = (d: SampleDatum): string => `${new Date(d.timestamp).toLocaleDateString()}`
  formatXTicks = (timestamp: number): string => (new Date(timestamp)).toLocaleDateString()
  x = (d: SampleDatum): number => d.timestamp
  y = [
    (d: SampleDatum): number => d.y,
    (d: SampleDatum): number => d.y2,
    (d: SampleDatum): number => -d.y3,
    (d: SampleDatum): number => -d.y1,
  ]

  onBrushStart = (): void => {
    this.crosshairRef?.component.hide()
  }

  onBrushMove = (selection: [number, number], e: { sourceEvent: MouseEvent }): void => {
    const content = `
      <div>Start: ${(new Date(selection?.[0])).toLocaleDateString()}</div>
      <div>End: ${(new Date(selection?.[1])).toLocaleDateString()}</div>
    `
    if (selection) this.tooltipRef?.component.show(content, { x: e.sourceEvent?.offsetX, y: e.sourceEvent?.offsetY })
  }

  onBrushEnd = (): void => {
    this.tooltipRef?.component.hide()
  }
}
