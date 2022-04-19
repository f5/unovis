import { Component, ViewChild, EventEmitter, ElementRef, AfterViewInit, Input, Output } from '@angular/core'

// Vis
import { BulletLegend, BulletLegendConfigInterface } from '@volterra/vis'

@Component({
  selector: 'vis-bullet-legend',
  templateUrl: './bullet-legend.component.html',
  styleUrls: ['./bullet-legend.component.css'],
})
export class BulletLegendComponent implements AfterViewInit {
  @ViewChild('legend', { static: false }) legendRef: ElementRef
  @Input() items: any[] = [];
  @Input() bulletSize: string = null;
  @Input() labelFontSize: string = null;
  @Input() labelMaxWidth: string = null;
  @Output() itemClick = new EventEmitter()

  legend = null
  config: BulletLegendConfigInterface = { items: [] }

  ngAfterViewInit (): void {
    this.config = {
      items: this.items,
      onLegendItemClick: (d, i): void => {
        this.itemClick.emit({ d, i })
        // this.legend.render()
      },
      bulletSize: this.bulletSize,
      labelFontSize: this.labelFontSize,
      labelMaxWidth: this.labelMaxWidth,
    }

    this.legend = new BulletLegend(this.legendRef.nativeElement, this.config)
  }

  ngOnChanges (changes): void {
    this.config.items = this.items
    this.legend?.update(this.config)
  }
}
