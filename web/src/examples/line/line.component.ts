// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import { AfterViewInit, Component } from '@angular/core'

// Vis
import { Line } from '@volterra/vis/components'

// Helpers
import { SampleDatum } from '../../utils/data'

import { Collection } from '../../utils/collection'

@Component({
  selector: 'line',
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.css'],
})

export class LineComponent implements AfterViewInit {
  title = 'line'
  margin = { top: 10, bottom: 10, left: 10, right: 10 }
  dimensions: {}
  collection = new Collection(Line)

  zeroLineConfig = this.collection.getConfig(0)
  zeroLineComponents = this.collection.getComponents(0)
  zeroLineData: SampleDatum[] = this.collection.getData(0)

  singleLineConfig = this.collection.getConfig(1)
  singleLineComponents = this.collection.getComponents(1)
  singleLineData: SampleDatum[] = this.collection.getData(1)

  dynamicLineConfig = this.collection.getConfig(5)
  dynamicLineComponents = this.collection.getComponents(5)
  dynamicLineData: SampleDatum[] = this.collection.getData(5)

  manyLineConfig = this.collection.getConfig(150)
  manyLineComponents = this.collection.getComponents(150)
  manyLineData: SampleDatum[] = this.collection.getData(150)

  fewLineConfig = this.collection.getConfig(15)
  fewLineComponents = this.collection.getComponents(15)
  fewLineData: SampleDatum[] = this.collection.getData(15)

  ngAfterViewInit (): void {
    console.log(this);
    
    let count = 0
    setInterval(() => {
      this.dynamicLineConfig = this.collection.getConfig(count%2 ? 5 : 0)
      count += 1
    }, 2000)
  }
}
