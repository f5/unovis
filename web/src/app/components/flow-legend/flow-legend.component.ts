// Copyright (c) Volterra, Inc. All rights reserved.
import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, Input } from '@angular/core'

// Vis
import { FlowLegend } from '@volterra/vis/components'

@Component({
  selector: 'vis-flow-legend',
  templateUrl: './flow-legend.component.html',
  styleUrls: ['./flow-legend.component.css'],
})
export class FlowLegendComponent implements OnInit, AfterViewInit {
  @ViewChild('legend', { static: false }) legendRef: ElementRef
  @Input() items: any[] = [];
  @Input() margin: { left?: number; right?: number } = { };

  legend = null
  config: { items?: any[] } = {}

  constructor () {
  }

  ngOnInit () {
  }

  ngAfterViewInit (): void {
    this.config = {
      items: this.items,
    }

    this.legend = new FlowLegend(this.legendRef.nativeElement, this.config)
  }

  ngOnChanges (): void {
    this.config.items = this.items
    this.legend?.update(this.config)
  }

  getMargin () {
    const { margin: { left, right } } = this
    return `0px ${right}px 0px ${left}px`
  }
}
