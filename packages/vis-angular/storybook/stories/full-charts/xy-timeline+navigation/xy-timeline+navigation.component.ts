// Copyright (c) Volterra, Inc. All rights reserved.
import { Component, Input, ViewChild } from '@angular/core'
import { VisTooltipComponent } from 'src/components/tooltip/tooltip.component'

@Component({
  selector: 'xy-timeline-navigation',
  template: `<div class="timelineNavigationChart">
    <div class="timeline">
      <vis-xy-container [duration]="_animationDuration" [margin]="margin" [padding]="padding" [data]="timelineData" [xDomain]="_selectedRange" [autoMargin]="autoMargin">
        <vis-timeline [x]="itemTimestamp" [length]="itemDuration" [color]="itemColor" [id]="itemId" [type]="itemType" [cursor]="itemCursor"></vis-timeline>
        <vis-tooltip></vis-tooltip>
        <vis-axis type="x" [tickFormat]="formatTicks"></vis-axis>
      </vis-xy-container>
    </div>
    <div class="navigation">
      <vis-xy-container [margin]="margin" [padding]="padding" [data]="navigationData" [autoMargin]="autoMargin">
        <vis-axis type="x" [tickFormat]="formatNavTicks"></vis-axis>
        <vis-stacked-bar [x]="navX" [y]="navY"></vis-stacked-bar>
        <vis-brush [draggable]="true" [selectionMinLength]="selectionMinLength" [onBrushStart]="_onBrushStart" [onBrushMove]="_onBrushMove" [onBrushEnd]="_onBrushEnd"></vis-brush>
      </vis-xy-container>
    </div>
  </div>`,
  styleUrls: ['./xy-timeline+navigation.css'],
})
export default class XyTimelineNavigationComponent<TimelineDatum, NavDatum> {
  @ViewChild(VisTooltipComponent, { static: false }) tooltipRef: VisTooltipComponent

  @Input() timelineData: TimelineDatum[] = []
  @Input() navigationData: NavDatum[] = []
  @Input() margin = { top: 10, bottom: 10, left: 10, right: 10 }
  @Input() autoMargin = true
  @Input() padding = {}

  @Input() itemTimestamp = (d: TimelineDatum): number => (d as any).timestamp
  @Input() itemDuration = (d: TimelineDatum): number => (d as any).duration
  @Input() itemType = (d: TimelineDatum, i: number): string => (d as any).name
  @Input() formatTicks = (timestamp: number): string => (new Date(timestamp)).toLocaleDateString()
  @Input() itemId = (d: TimelineDatum): string => (d as any).id
  @Input() itemColor = (d: TimelineDatum): string => (d as any).color
  @Input() itemCursor: string | ((d: TimelineDatum) => string)

  @Input() navX = (d: NavDatum): number => (d as any).timestamp
  @Input() navY = (d: NavDatum): number => (d as any).value
  @Input() selectionMinLength: number
  @Input() onBrushStart: (selection: [number, number], e: { sourceEvent: MouseEvent }, userDriven: boolean) => void
  @Input() onBrushMove: (selection: [number, number], e: { sourceEvent: MouseEvent }, userDriven: boolean) => void
  @Input() onBrushEnd: (selection: [number, number], e: { sourceEvent: MouseEvent }, userDriven: boolean) => void
  @Input() formatNavTicks = (timestamp: number): string => (new Date(timestamp)).toLocaleDateString()

  private _selectedRange: [number, number] | undefined
  private _animationDuration: number | undefined

  _onBrushStart = (selection: [number, number], e: { sourceEvent: MouseEvent }, userDriven: boolean): void => {
    this._animationDuration = 0
    this.onBrushStart?.(selection, e, userDriven)
  }

  _onBrushMove = (selection: [number, number], e: { sourceEvent: MouseEvent }, userDriven: boolean): void => {
    if (userDriven) this._selectedRange = selection
    this.onBrushMove?.(selection, e, userDriven)
  }

  _onBrushEnd = (selection: [number, number], e: { sourceEvent: MouseEvent }, userDriven: boolean): void => {
    this._animationDuration = undefined
    this.onBrushEnd?.(selection, e, userDriven)
  }
}
