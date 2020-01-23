// Copyright (c) Volterra, Inc. All rights reserved.
import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, Input } from '@angular/core'

// Vis
import { SankeyLegend } from '@volterra/vis/components'

@Component({
  selector: 'vis-sankey-legend',
  templateUrl: './sankey-legend.component.html',
  styleUrls: ['./sankey-legend.component.css'],
})
export class SankeyLegendComponent implements OnInit, AfterViewInit {
  @ViewChild('legend', { static: false }) legendRef: ElementRef
  @Input() items: any[] = [];
  @Input() margin: {} = {};

  legend = null
  config: { items?: any[]; margin?: {} } = {}

  constructor () {
  }

  ngOnInit () {
  }

  ngAfterViewInit (): void {
    this.config = {
      items: this.items,
      margin: this.margin,
    }

    this.legend = new SankeyLegend(this.legendRef.nativeElement, this.config)
  }

  ngOnChanges (changes): void {
    this.config.items = this.items
    this.legend?.update(this.config)
  }
}
