// Copyright (c) Volterra, Inc. All rights reserved.
import { Component, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core'

// Vis
import { FlowLegend } from '@volterra/vis'

@Component({
  selector: 'vis-flow-legend',
  templateUrl: './flow-legend.component.html',
  styleUrls: ['./flow-legend.component.css'],
})
export class FlowLegendComponent implements AfterViewInit {
  @ViewChild('legend', { static: false }) legendRef: ElementRef
  @Input() items: any[] = [];
  @Input() margin: { left?: number; right?: number } = {};
  @Input() width: number;

  legend = null
  config: { items?: any[]; customWidth?: number } = {}

  ngAfterViewInit (): void {
    this.config = {
      items: this.items,
      customWidth: this.width,
    }

    this.legend = new FlowLegend(this.legendRef.nativeElement, this.config)
  }

  ngOnChanges (): void {
    this.config.items = this.items
    this.config.customWidth = this.width
    this.legend?.update(this.config)
  }

  getMargin (): string {
    const { margin: { left, right } } = this
    return `0px ${right || 0}px 0px ${left || 0}px`
  }
}
