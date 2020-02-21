// Copyright (c) Volterra, Inc. All rights reserved.
import { OnInit, Component, Input } from '@angular/core'

// Vis
import { Axis, Sankey } from '@volterra/vis'

@Component({
  selector: 'collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css'],
})

export class Collection implements OnInit {
  @Input() component
  @Input() dataGenerator
  @Input() configGenerator
  @Input() axesGenerator
  title = 'collection'
  margin = { top: 10, bottom: 10, left: 10, right: 10 }
  dimensions: {}
  items = {}

  options = {
    'Many Data Elements': 500,
    'Few Data Elements': 50,
    'No Data ↔︎ Data': 30,
    'Single Data Element': 1,
    'No Data': 0,
  }

  ngOnInit (): void {
    const ComponentConstructor = this.component
    this.items = Object.keys(this.options).reduce((items, key) => {
      const n = this.options[key]
      const config = this.configGenerator(n)
      const component = new ComponentConstructor(config)

      items[key] = {
        margin: this.margin,
        component: component,
        config: config,
        data: this.dataGenerator(n),
        type: key,
        numDataElements: n,
        axes: this.axesGenerator ? this.axesGenerator() : {
          x: new Axis({ label: 'x axis' }),
          y: new Axis({ label: 'y axis' }),
        },
      }

      return items
    }, {})

    let interval = 0
    setInterval(() => {
      const item = this.items['No Data ↔︎ Data']
      const n = interval % 2 ? item.numDataElements : 0
      item.config = this.configGenerator(n)
      item.data = this.dataGenerator(n)
      interval += 1
    }, 4000)

    setInterval(() => {
      const item = this.items['Few Data Elements']
      item.data = this.dataGenerator(item.numDataElements)
    }, 3000)
  }

  getItems (): any[] {
    return Object.values(this.items)
  }

  isSingle (): boolean {
    return this.component === Sankey
  }
}
