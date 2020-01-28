// Copyright (c) Volterra, Inc. All rights reserved.
import { Component, ViewChild, EventEmitter, ElementRef, AfterViewInit, Input, Output } from '@angular/core'

// Vis
import { BulletLegend } from '@volterra/vis/components'

@Component({
  selector: 'vis-bullet-legend',
  templateUrl: './bullet-legend.component.html',
  styleUrls: ['./bullet-legend.component.css'],
})
export class BulletLegendComponent implements AfterViewInit {
  @ViewChild('legend', { static: false }) legendRef: ElementRef
  @Input() items: any[] = [];
  @Output() itemClick = new EventEmitter()

  legend = null
  config: { items?: any[]; onLegendItemClick?: any } = {}

  ngAfterViewInit (): void {
    this.config = {
      items: this.items,
      onLegendItemClick: (d, i): void => {
        this.itemClick.emit({ d, i })
        // this.legend.render()
      },
    }

    this.legend = new BulletLegend(this.legendRef.nativeElement, this.config)
  }

  ngOnChanges (changes): void {
    this.config.items = this.items
    this.legend?.update(this.config)
  }
}
