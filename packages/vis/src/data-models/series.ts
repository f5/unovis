// Copyright (c) Volterra, Inc. All rights reserved.
import { extent, max, min } from 'd3-array'

// Types
import { NumericAccessor } from 'types/misc'

// Utils
import { isArray, getValue } from 'utils/data'

// Core
import { CoreDataModel } from './core'

export class SeriesDataModel<Data> extends CoreDataModel<Data[]> {
  data: Data[] = [];

  constructor (data: Data[] = []) {
    super(data)
  }

  getStackedExtent (acs: NumericAccessor<Data> | NumericAccessor<Data>[]): number[] {
    const { data } = this

    if (isArray(acs)) {
      let minValue = 0
      let maxValue = 0
      for (const d of data) {
        let positiveStack = 0
        let negativeStack = 0
        for (const a of acs as NumericAccessor<Data>[]) {
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

  getExtent (acs: NumericAccessor<Data> | NumericAccessor<Data>[]): number[] {
    return [this.getMin(acs), this.getMax(acs)]
  }

  getMin (acs: NumericAccessor<Data> | NumericAccessor<Data>[]): number {
    const { data } = this

    if (isArray(acs)) {
      const minValue = min(data, d => min(acs as NumericAccessor<Data>[], a => getValue(d, a)))
      return minValue
    } else return min(data, d => getValue(d, acs))
  }

  getMax (acs: NumericAccessor<Data> | NumericAccessor<Data>[]): number {
    const { data } = this

    if (isArray(acs)) {
      const maxValue = max(data, d => max(acs as NumericAccessor<Data>[], a => getValue(d, a)))
      return maxValue
    } else return max(data, d => getValue(d, acs))
  }
}
