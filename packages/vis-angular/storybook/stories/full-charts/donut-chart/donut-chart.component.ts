// Copyright (c) Volterra, Inc. All rights reserved.
import { Component, Input } from '@angular/core'

@Component({
  selector: 'donut-chart',
  template: `<div class="chart">
     <vis-single-container [data]="data">
        <vis-donut [value]="value" [arcWidth]="55" centralLabel="4K"></vis-donut>
     </vis-single-container>
  </div>`,
  styleUrls: ['./donut-chart.css'],
})
export default class DonutChartComponent {
  @Input() data = [{ v: 5 }, { v: 1 }, { v: 10 }, { v: 3 }, { v: 5 }]
  @Input() margin = { top: 10, bottom: 10, left: 10, right: 10 }
  @Input() value = (d: { v: number }): number => d.v
}
