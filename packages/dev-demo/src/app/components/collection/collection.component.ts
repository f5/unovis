/* eslint-disable @typescript-eslint/naming-convention */

import { OnInit, OnDestroy, Component, Input } from '@angular/core'

// Vis
import { Sankey } from '@volterra/vis'

@Component({
  selector: 'collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css'],
})

export class Collection implements OnInit, OnDestroy {
  @Input() component
  @Input() dataGenerator
  @Input() configGenerator
  @Input() axesGenerator
  title = 'collection'
  margin = { top: 10, bottom: 10, left: 10, right: 10 }
  items = {}
  itemValues: any[]
  intervalIds: NodeJS.Timeout[] = []

  options = {
    'Few Data Elements': 10,
    'Transition: Data ↔︎ No Data': 30,
    'Single Data Element': 1,
    'No Data': 0,
    'Many Data Elements': 165,
  }

  ngOnInit (): void {
    const ComponentConstructor = this.component
    this.items = Object.keys(this.options).reduce((items, key) => {
      const n = this.options[key]
      const config = this.configGenerator(n)
      const component = new ComponentConstructor(config)
      const axes = this.axesGenerator?.()

      items[key] = {
        margin: this.margin,
        component: component,
        config: config,
        data: this.dataGenerator(n),
        type: key,
        numDataElements: n,
        xAxis: axes?.x,
        yAxis: axes?.y,
      }

      return items
    }, {})

    this.itemValues = Object.values(this.items)

    let interval = 0
    let intervalId = setInterval(() => {
      const item = this.items['Transition: Data ↔︎ No Data']
      const n = interval % 2 ? item.numDataElements : 0
      item.config = this.configGenerator(n)
      item.data = this.dataGenerator(n)
      interval += 1
    }, 4000)
    this.intervalIds.push(intervalId)

    intervalId = setInterval(() => {
      const item = this.items['Few Data Elements']
      item.data = this.dataGenerator(item.numDataElements)
    }, 3000)
    this.intervalIds.push(intervalId)
  }

  ngOnDestroy (): void {
    this.intervalIds.forEach(intervalId => {
      clearInterval(intervalId)
    })
  }

  getItems (): any[] {
    return this.itemValues
  }

  isSingle (): boolean {
    return this.component === Sankey
  }
}
