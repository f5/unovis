// Copyright (c) Volterra, Inc. All rights reserved.
import { max, min, bisector } from 'd3-array'

// Types
import { NumericAccessor } from 'types/misc'

// Utils
import { isArray, getValue } from 'utils/data'

// Core
import { CoreDataModel } from './core'

export class SeriesDataModel<Datum> extends CoreDataModel<Datum[]> {
  constructor (data: Datum[] = []) {
    super(data)
  }

  getStackedExtent (...acs: NumericAccessor<Datum>[]): number[] {
    const { data } = this

    if (isArray(acs)) {
      let minValue = 0
      let maxValue = 0
      for (const d of data) {
        let positiveStack = 0
        let negativeStack = 0
        for (const a of acs as NumericAccessor<Datum>[]) {
          const value = getValue(d, a) || 0
          if (value >= 0) positiveStack += value
          else negativeStack += value
        }

        if (positiveStack > maxValue) maxValue = positiveStack
        if (negativeStack < minValue) minValue = negativeStack
      }
      return [minValue, maxValue]
    }
  }

  getStackedValues (d: Datum, ...acs: NumericAccessor<Datum>[]): number[] {
    const values = []
    let positiveStack = 0
    let negativeStack = 0
    for (const a of acs as NumericAccessor<Datum>[]) {
      const value = getValue(d, a) || 0
      if (value >= 0) {
        positiveStack += value
        values.push(positiveStack)
      } else {
        negativeStack += value
        values.push(negativeStack)
      }
    }

    return values
  }

  getExtent (...acs: NumericAccessor<Datum>[]): number[] {
    return [this.getMin(...acs), this.getMax(...acs)]
  }

  getMin (...acs: NumericAccessor<Datum>[]): number {
    const { data } = this

    const minValue = min(data, d => min(acs as NumericAccessor<Datum>[], a => getValue(d, a)))
    return minValue
  }

  getMax (...acs: NumericAccessor<Datum>[]): number {
    const { data } = this

    const maxValue = max(data, d => max(acs as NumericAccessor<Datum>[], a => getValue(d, a)))
    return maxValue
  }

  getNearest (value: number, accessor: NumericAccessor<Datum>): Datum {
    const { data } = this
    if (data.length <= 1) return data[0]

    const xBisector = bisector(d => getValue(d, accessor)).left
    const index = xBisector(data, value, 1, data.length - 1)
    return value - getValue(data[index - 1], accessor) > getValue(data[index], accessor) - value ? data[index] : data[index - 1]
  }
}
