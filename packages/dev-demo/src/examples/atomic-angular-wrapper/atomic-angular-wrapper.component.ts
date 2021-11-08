// Copyright (c) Volterra, Inc. All rights reserved.
import { Component, ViewChild } from '@angular/core'
import { VisCrosshairComponent, VisTooltipComponent } from '@volterra/vis-angular'
import { XYLabels, XYLabelCluster, BulletLegendItemInterface } from '@volterra/vis'

// Helpers
import { sampleSeriesData, SampleDatum } from '../../utils/data'

@Component({
  selector: 'atomic-angular-wrapper',
  templateUrl: './atomic-angular-wrapper.component.html',
  styleUrls: ['./atomic-angular-wrapper.component.scss'],
})
export class AtomicAngularWrapperComponent {
  @ViewChild(VisCrosshairComponent, { static: false }) crosshairRef: VisCrosshairComponent<SampleDatum>
  @ViewChild(VisTooltipComponent, { static: false }) tooltipRef: VisTooltipComponent

  title = 'atomic-angular-wrapper'

  // Data
  data: SampleDatum[] = sampleSeriesData(100)
  margin = { top: 10, bottom: 30, left: 10, right: 10 }
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

  alerts: { timestamp: number; label: string }[] = Array(10).fill(null).map(() => ({
    timestamp: this.data[Math.floor(Math.random() * this.data.length)].timestamp,
    label: '',
  }))

  labelAccessor = (d: { timestamp: number; label: string }): string => d.label
  triggers = {
    [XYLabels.selectors.label]: (d: SampleDatum) => d.timestamp.toString(),
    [XYLabels.selectors.cluster]: (data: XYLabelCluster<SampleDatum>) => `${data.records.length} alerts`,
  }

  legendItems: BulletLegendItemInterface[] = [{ name: 'Hello' }, { name: 'World' }]

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
