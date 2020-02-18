// Copyright (c) Volterra, Inc. All rights reserved.
import { AfterViewInit, Component } from '@angular/core'

@Component({
  selector: 'scatter',
  templateUrl: './scatter.component.html',
  styleUrls: ['./scatter.component.css'],
})

export class ScatterComponent implements AfterViewInit {
  title = 'scatter'
  componentType = 'scatter'

  ngAfterViewInit (): void {
  }
}
