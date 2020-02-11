// Copyright (c) Volterra, Inc. All rights reserved.
import { extent, max, min, bisector } from 'd3-array'

// Types
import { NumericAccessor } from 'types/misc'

// Utils
import { isArray, getValue } from 'utils/data'

// Core
import { CoreDataModel } from './core'

export class SeriesDataModel<Datum> extends CoreDataModel<Datum[]> {
  data: Datum[] = [];

  constructor (data: Datum[] = []) {
    super(data)
  }

  getStackedExtent (acs: NumericAccessor<Datum> | NumericAccessor<Datum>[]): number[] {
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
    } else return extent(data, d => getValue(d, acs))
  }

  getAreaStackedExtent (acs: NumericAccessor<Datum> | NumericAccessor<Datum>[]): number[] {
    const { data } = this

    if (isArray(acs)) {
      let minValue: number
      let maxValue: number
      for (const d of data) {
        let positiveStack: number
        let negativeStack: number
        for (const a of acs as NumericAccessor<Datum>[]) {
          const value = getValue(d, a) || 0
          if (value >= 0) {
            if (!positiveStack) positiveStack = 0
            positiveStack += value
          } else {
            if (!negativeStack) negativeStack = 0
            negativeStack += value
          }
        }

        if (positiveStack) {
          if (!maxValue) maxValue = 0
          if (positiveStack > maxValue) maxValue = positiveStack
        }
        if (negativeStack) {
          if (!minValue) minValue = 0
          if (negativeStack < minValue) minValue = negativeStack
        }
      }
      if (!minValue) minValue = this.getMin(acs)
      if (!maxValue) maxValue = this.getMax(acs)
      return [minValue, maxValue]
    } else return extent(data, d => getValue(d, acs))
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

  getExtent (acs: NumericAccessor<Datum> | NumericAccessor<Datum>[]): number[] {
    return [this.getMin(acs), this.getMax(acs)]
  }

  getMin (acs: NumericAccessor<Datum> | NumericAccessor<Datum>[]): number {
    const { data } = this

    if (isArray(acs)) {
      const minValue = min(data, d => min(acs as NumericAccessor<Datum>[], a => getValue(d, a)))
      return minValue
    } else return min(data, d => getValue(d, acs))
  }

  getMax (acs: NumericAccessor<Datum> | NumericAccessor<Datum>[]): number {
    const { data } = this

    if (isArray(acs)) {
      const maxValue = max(data, d => max(acs as NumericAccessor<Datum>[], a => getValue(d, a)))
      return maxValue
    } else return max(data, d => getValue(d, acs))
  }

  getNearest (value: number, accessor: NumericAccessor<Datum>): Datum {
    const { data } = this
    if (data.length <= 1) return data[0]

    const xBisector = bisector(d => getValue(d, accessor)).left
    const index = xBisector(data, value, 1, data.length - 1)
    return value - getValue(data[index - 1], accessor) > getValue(data[index], accessor) - value ? data[index] : data[index - 1]
  }
}
