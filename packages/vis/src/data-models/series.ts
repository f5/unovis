// Copyright (c) Volterra, Inc. All rights reserved.
import { extent, max, min } from 'd3-array'

// Utils
import { NumericAccessor } from 'utils/types'
import { isArray, getValue } from 'utils/data'

// Core
import { CoreDataModel } from './core'

export class SeriesDataModel extends CoreDataModel {
  data: any[]

  constructor (data?: any) {
    super(data)
  }

  getStackedExtent (acs: NumericAccessor | NumericAccessor[]): number[] {
    const { data } = this

    if (isArray(acs)) {
      let minValue = 0
      let maxValue = 0
      for (const d of data) {
        let positiveStack = 0
        let negativeStack = 0
        for (const a of <NumericAccessor[]>acs) {
          const value = getValue(d, a) || 0
          if (value >= 0) positiveStack += value
          else negativeStack += value
        }

        if (positiveStack > maxValue) maxValue = positiveStack
        if (negativeStack < minValue) minValue = negativeStack
      }
      return [minValue, maxValue]
    } else return extent(data, d => getValue(d, acs))
  }

  getExtent (acs: NumericAccessor | NumericAccessor[]): number[] {
    const { data } = this

    if (isArray(acs)) {
      const maxValue = max(data, d => max(<NumericAccessor[]>acs, a => getValue(d, a)))
      const minValue = min(data, d => min(<NumericAccessor[]>acs, a => getValue(d, a)))
      return [minValue, maxValue]
    } else return extent(data, d => getValue(d, acs))
  }
}
