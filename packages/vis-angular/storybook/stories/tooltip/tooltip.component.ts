// Copyright (c) Volterra, Inc. All rights reserved.
import { Axis, XYContainer } from '@volterra/vis'
import { AfterViewInit, Component, ContentChild, ElementRef, ViewChild } from '@angular/core'
import { VisTooltipComponent } from 'src/components/tooltip/tooltip.component'
import { DataRecord, generateDataRecords } from '../../data/time-series'

@Component({
  selector: 'tooltip-example',
  template: `
    <div #altContainer class="container" [class.hidden]="!useAltContainer"></div>
    <button *ngIf="showButton" (click)="showTooltip($e)">{{tooltipVisible ? 'Hide' : ' Show'}} tooltip</button>
    <div #chart class="chart"></div>
  `,
  styles: [`
    .chart { height: 300px; }
    .hidden { display: none; }
    .container { margin: 0 auto; width: 100px; height: 100px; border: 3px solid gray; }
  `],
})
export class TooltipExampleComponent implements AfterViewInit {
  @ContentChild(VisTooltipComponent) tooltipRef: VisTooltipComponent;
  @ViewChild('altContainer') altContainer: ElementRef;
  @ViewChild('chart') chartRef: ElementRef;

  chart: XYContainer<DataRecord>;
  data: DataRecord[] = generateDataRecords(10);
  showButton = false;
  tooltipVisible = false;
  useAltContainer = false;

  ngAfterViewInit (): void {
    if (this.tooltipRef.container) {
      this.useAltContainer = true
      this.tooltipRef.component.setContainer(this.altContainer.nativeElement)
    }
    this.showButton = !this.tooltipRef.triggers

    const chartConfig = {
      components: this.tooltipRef.components,
      xAxis: new Axis<DataRecord>(),
      yAxis: new Axis<DataRecord>(),
      tooltip: this.tooltipRef.component,
    }
    this.chart = new XYContainer<DataRecord>(this.chartRef.nativeElement, chartConfig, this.data)
  }

  showTooltip (): void {
    if (this.tooltipVisible) {
      this.tooltipRef.component?.hide()
    } else {
      this.tooltipRef.component?.show('<p>Custom tooltip</p>', { x: this.chart.width / 2, y: 150 })
    }
    this.tooltipVisible = !this.tooltipVisible
  }
}
