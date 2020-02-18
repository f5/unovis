// Copyright (c) Volterra, Inc. All rights reserved.
import { AfterViewInit, Component, Input } from '@angular/core'

// Vis
import { Axis, Scatter } from '@volterra/vis/components'
import { SymbolType } from '@volterra/vis/types'

// Helpers
import { sampleScatterData } from '../../../utils/data'

@Component({
  selector: 'collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css'],
})

export class Collection implements AfterViewInit {
  @Input() componentType
  title = 'collection'
  margin = { top: 10, bottom: 10, left: 10, right: 10 }
  dimensions: {}
  items = []

  ngAfterViewInit (): void {
    this.items = ['many', 'few', 'dynamic', 'single', 'zero'].map(type => {
      const n = this.getNItems(type)
      const config = this.getConfig()
      const component = this.getComponent(config)
      return {
        margin: this.margin,
        components: [component],
        componentConfigs: [config],
        data: this.getData(n),
        type,
        axes: {
          x: new Axis({ label: 'x axis' }),
          y: new Axis({ label: 'y axis' }),
        },
      }
    })

    setInterval(() => {
      this.items[2].data = this.getData(this.items[2].data.length ? 0 : this.getNItems('dynamic'))
    }, 2000)
  }

  getItems (): any[] {
    return this.items
  }

  getComponent (config): any {
    const { componentType } = this
    switch (componentType) {
    case 'scatter':
      return new Scatter(config)
    }
  }

  getData (n: number): any {
    const { componentType } = this
    switch (componentType) {
    case 'scatter':
      return sampleScatterData(n, n >= 500 ? 5 : null, n >= 500 ? 10 : null)
    }
  }

  getConfig () {
    const { componentType } = this
    switch (componentType) {
    case 'scatter':
      return {
        x: (d): number => d.x,
        y: (d): number => d.y,
        size: (d): number => d.size,
        shape: (d): SymbolType => d.shape,
        icon: (d): any => d.icon,
      }
    }
  }

  getNItems (type: string): number {
    switch (type) {
    case 'many':
      return 500
    case 'few':
      return 50
    case 'dynamic':
      return 30
    case 'single':
      return 1
    case 'zero':
      return 0
    }
  }
}
