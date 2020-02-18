// Copyright (c) Volterra, Inc. All rights reserved.
// Vis
import { Line } from '@volterra/vis/components'

import { sampleSeriesData } from './data'

export class Collection {
  constructor (componentType) {
    this.componentType = componentType
  }

  getConfig (numItems) {
    switch (this.componentType) {
    case Line:
      return {
        x: d => d.x,
        y: new Array(numItems).fill(0).map((d, i) => {
          return d => d[`y${i || ''}`]
        }),
      }
    default:
      break
    }
  }

  getComponents (numItems) {
    const { componentType } = this
    const config = this.getConfig(numItems)
    const component = new componentType(config)
    return [component]
  }

  getData (numItems) {
    switch (this.componentType) {
    case Line: {
      const data = sampleSeriesData(30)
      data.forEach(d => {
        for (let i = 5; i < numItems - 5; i++) {
          d[`y${i}`] = Math.random()
        }
      })
      return data
    }
    default:
      break
    }
  }
}
