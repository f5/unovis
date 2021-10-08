// Copyright (c) Volterra, Inc. All rights reserved.
import { Component } from '@angular/core'

// Helpers
import { sampleSeriesData, SampleDatum } from '../../utils/data'

@Component({
  selector: 'atomic-angular-wrapper',
  templateUrl: './atomic-angular-wrapper.component.html',
  styleUrls: ['./atomic-angular-wrapper.component.css'],
})

export class AtomicAngularWrapperComponent {
  title = 'atomic-angular-wrapper'

  // Data
  data: SampleDatum[] = sampleSeriesData(100)
  customData: SampleDatum[] = sampleSeriesData(10)
  margin = { top: 10, bottom: 10, left: 10, right: 10 }
  padding = {}
  x = (d: SampleDatum): number => d.timestamp
  y = (d: SampleDatum): number => d.y
}
