// Copyright (c) Volterra, Inc. All rights reserved.

import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core'
import { Single } from '@volterra/vis'

@Component({
  selector: 'single',
  templateUrl: './single.component.html',
  styleUrls: ['./single.component.css']
})

export class SingleComponent implements OnInit, AfterViewInit {
  title = 'single'
  chart: any
  data: any
  config: any
  @ViewChild('chart', { static: false }) chartView: ElementRef

  ngAfterViewInit (): void {
    const chartElement = this.chartView.nativeElement
    this.chart = new Single(chartElement, this.config, this.data)
  }

  ngOnInit (): void {
    this.data = []
    this.config = {}
  }
}
