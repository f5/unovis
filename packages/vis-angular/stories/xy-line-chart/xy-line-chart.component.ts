// Copyright (c) Volterra, Inc. All rights reserved.
import { Component, Input } from '@angular/core'

@Component({
  selector: 'xy-line-chart',
  template: `<div class="chart">
     <vis-xy-container
         [margin]="margin"
         [padding]="padding"
         [data]="data"
     >
      <vis-area [x]="x" [y]="y" [opacity]="1"></vis-area>
      <vis-line [x]="x" [y]="y" [color]="'black'"></vis-line>
      <vis-crosshair [x]="x" [y]="y" template="hello"></vis-crosshair>
      <vis-axis type="x" label="X Axis"></vis-axis>
      <vis-axis type="y" label="X Axis"></vis-axis>
     </vis-xy-container>
  </div>`,
  styleUrls: ['./xy-line-chart.css'],
})
export default class XYLineChartComponent {
  @Input() data = [{ x: 0, y: 5 }, { x: 1, y: 1 }, { x: 2, y: 10 }, { x: 3, y: 3 }, { x: 4, y: 5 }]
  @Input() margin = { top: 10, bottom: 10, left: 10, right: 10 }
  @Input() padding = {}
  @Input() x = (d): number => d.x
  @Input() y = (d): number => d.y
}
