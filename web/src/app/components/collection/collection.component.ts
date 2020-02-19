// Copyright (c) Volterra, Inc. All rights reserved.
import { OnInit, Component, Input } from '@angular/core'

// Vis
import { Axis } from '@volterra/vis/components'

@Component({
  selector: 'collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css'],
})

export class Collection implements OnInit {
  @Input() component
  @Input() dataGenerator
  @Input() config
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
      const component = new ComponentConstructor(this.config)

      items[key] = {
        margin: this.margin,
        components: [component],
        componentConfigs: [this.config],
        data: this.dataGenerator(n),
        type: key,
        numDataElements: n,
        axes: {
          x: new Axis({ label: 'x axis' }),
          y: new Axis({ label: 'y axis' }),
        },
      }

      return items
    }, {})

    setInterval(() => {
      const item = this.items['No Data ↔︎ Data']
      item.data = this.dataGenerator(item.data.length ? 0 : item.numDataElements)
    }, 4000)

    setInterval(() => {
      const item = this.items['Few Data Elements']
      item.data = this.dataGenerator(item.numDataElements)
    }, 3000)
  }

  getItems (): any[] {
    return Object.values(this.items)
  }
}
