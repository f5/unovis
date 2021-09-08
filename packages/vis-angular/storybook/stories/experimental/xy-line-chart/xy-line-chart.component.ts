// Copyright (c) Volterra, Inc. All rights reserved.
import { Component, Input, ViewChild } from '@angular/core'
import { VisCrosshairComponent } from 'src/components/crosshair/crosshair.component'
import { VisTooltipComponent } from 'src/components/tooltip/tooltip.component'
import { DataRecord } from './xy-line-chart.types'

@Component({
  selector: 'xy-line-chart',
  template: `<div class="chart">
     <vis-xy-container
         [margin]="margin"
         [padding]="padding"
         [data]="data"
     >
      <vis-line [x]="x" [y]="y"></vis-line>
      <vis-crosshair [x]="x" [y]="y" [template]="crosshairTemplate"></vis-crosshair>
      <vis-tooltip></vis-tooltip>
      <vis-free-brush mode="x" [selectionMinLength]="0.25" [onBrushStart]="onBrushStart" [onBrushMove]="onBrushMove" [onBrushEnd]="onBrushEnd"></vis-free-brush>
      <vis-axis type="x" label="Time" [tickFormat]="formatXTicks"></vis-axis>
      <vis-axis type="y" label="Value"></vis-axis>
     </vis-xy-container>
  </div>`,
  styleUrls: ['./xy-line-chart.css'],
})
export default class XYLineChartComponent {
  @ViewChild(VisCrosshairComponent, { static: false }) crosshairRef: VisCrosshairComponent<DataRecord>
  @ViewChild(VisTooltipComponent, { static: false }) tooltipRef: VisTooltipComponent<DataRecord>

  @Input() data: DataRecord[] = Array(100).fill(0).map((_, i: number) => ({
    timestamp: Date.now() + i * 1000 * 60 * 60 * 24,
    value: i / 10 + Math.sin(i / 5) + Math.cos(i / 3),
  }))

  @Input() margin = { top: 10, bottom: 10, left: 10, right: 10 }
  @Input() padding = {}
  @Input() x = (d: DataRecord): number => d.timestamp
  @Input() y = (d: DataRecord): number => d.value
  @Input() formatXTicks = (timestamp: number): string => (new Date(timestamp)).toLocaleDateString()

  crosshairTemplate = (d: DataRecord): string => `${new Date(d.timestamp).toLocaleDateString()}`

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
