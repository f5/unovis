// Copyright (c) Volterra, Inc. All rights reserved.

import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core'
import { Composite } from '@volterra/vis'

@Component({
  selector: 'composite',
  templateUrl: './composite.component.html',
  styleUrls: ['./composite.component.css']
})

export class CompositeComponent implements OnInit, AfterViewInit {
  title = 'composite'
  chart: any
  data: any
  config: any
  @ViewChild('chart', { static: false }) chartRef: ElementRef

  ngAfterViewInit (): void {
    const chartElement = this.chartRef.nativeElement
    this.chart = new Composite(chartElement, this.config, this.data)
  }

  ngOnInit (): void {
    this.data = []
    this.config = {}
  }
}
