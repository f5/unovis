// Copyright (c) Volterra, Inc. All rights reserved.
import { extent, max, min, sum } from 'd3-array'

// Core
import { CoreDataModel } from './core'

// Utils
import { numericAccessor } from 'utils/types'
import { isArray, getValue } from 'utils/data'

export class SeriesDataModel extends CoreDataModel {
  data: any[]

  constructor (data?: any) {
    super(data)
  }

  getStackedExtent (acs: numericAccessor | numericAccessor[]): number[] {
    const { data } = this

    if (isArray(acs)) {
      let minValue = 0
      let maxValue = 0
      for (const d of data) {
        let positiveStack = 0
        let negativeStack = 0
        for (const a of acs) {
          const value = getValue(d, a) || 0
          if (value >= 0) positiveStack += value
          else negativeStack += value
        }

        if (positiveStack > maxValue) maxValue = positiveStack
        if (negativeStack < minValue) minValue = negativeStack
      }
      // const dataPositive = data.filter(d => d >= 0)
      // const dataNegative = data.filter(d => d < 0)
      // console.log({ dataPositive, dataNegative })
      // const maxValue = max(dataPositive, d => sum(acs, a => getValue(d, a)))
      // const minValue = min(dataNegative, d => sum(acs, a => getValue(d, a)))
      console.log({ minValue, maxValue })
      return [minValue, maxValue]
    } else return extent(data, d => getValue(d, acs))
  }

  getExtent (acs: numericAccessor | numericAccessor[]): number[] {
    const { data } = this

    if (isArray(acs)) {
      const maxValue = max(data, d => max(acs, a => getValue(d, a)))
      const minValue = min(data, d => min(acs, a => getValue(d, a)))
      return [minValue, maxValue]
    } else return extent(data, d => getValue(d, acs))
  }
}
