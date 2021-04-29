// Copyright (c) Volterra, Inc. All rights reserved.
import _isUndefined from 'lodash/isUndefined'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _isEqual from 'lodash/isEqual'
import _isNil from 'lodash/isNil'
import _cloneDeep from 'lodash/cloneDeep'
import _throttle from 'lodash/throttle'
import _each from 'lodash/each'
import _filter from 'lodash/filter'
import _get from 'lodash/get'
import _without from 'lodash/without'
import _find from 'lodash/find'
import _findIndex from 'lodash/findIndex'
import _isString from 'lodash/isString'
import _isObject from 'lodash/isObject'
import _isFunction from 'lodash/isFunction'
import _isNumber from 'lodash/isNumber'
import _merge from 'lodash/merge'
import _isPlainObject from 'lodash/isPlainObject'
import _flatten from 'lodash/flatten'
import _omit from 'lodash/omit'
import _extend from 'lodash/extend'
import _groupBy from 'lodash/groupBy'
import _uniq from 'lodash/uniq'
import _sortBy from 'lodash/sortBy'
import _range from 'lodash/range'
// !!! If you add a new lodash import here, please specify it in rollup.config.js as well

import { max, min, mean, bisector } from 'd3-array'

// Types
import { NumericAccessor } from 'types/misc'

export const isNumber = _isNumber
export const isEqual = _isEqual
export const isFunction = _isFunction
export const merge = _merge
export const isPlainObject = _isPlainObject
export const isUndefined = _isUndefined
export const isArray = _isArray
export const isEmpty = _isEmpty
export const isNil = _isNil
export const cloneDeep = _cloneDeep
export const each = _each
export const filter = _filter
export const get = _get
export const without = _without
export const find = _find
export const findIndex = _findIndex
export const isString = _isString
export const isObject = _isObject
export const throttle = _throttle
export const flatten = _flatten
export const omit = _omit
export const extend = _extend
export const groupBy = _groupBy
export const uniq = _uniq
export const sortBy = _sortBy
export const range = _range

export function getValue (d, accessor, index?: number): any {
  if (isFunction(accessor)) return accessor(d, index)
  else return accessor
}

export function clean (data: any[]): any[] {
  return data.filter(d => d && !isNumber(d))
}

export function clamp (d: number, min: number, max: number): number {
  return Math.min(Math.max(d, min), max)
}

export function countUnique (array, accessor = d => d): number {
  return new Set(array.map(d => accessor(d))).size
}

export function indexArray (n: number): number[] {
  return [...Array(n).keys()]
}

export function shallowDiff (o1: Record<string, unknown> = {}, o2: Record<string, unknown> = {}): Record<string, unknown> {
  return Object.keys(o2).reduce((diff, key) => {
    if (o1[key] === o2[key]) return diff
    return {
      ...diff,
      [key]: o2[key],
    }
  }, {})
}

export function getStackedExtent<Datum> (data: Datum[], ...acs: NumericAccessor<Datum>[]): number[] {
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

export function getStackedValues<Datum> (d: Datum, ...acs: NumericAccessor<Datum>[]): number[] {
  const values = []

  let positiveStack = 0
  let negativeStack = 0
  for (const a of acs as NumericAccessor<Datum>[]) {
    const value = getValue(d, a) || 0
    if (value >= 0) {
      values.push(positiveStack += value)
    } else {
      values.push(negativeStack += value)
    }
  }

  return values
}

export function getStackedData<Datum> (data: Datum[], baseline: NumericAccessor<Datum>, ...acs: NumericAccessor<Datum>[]): number[][][] {
  const baselineValues = data.map(d => getValue(d, baseline) || 0)
  const isNegativeStack = acs.map(a => mean(data, d => getValue(d, a) || 0) < 0)

  const stackedData = acs.map(() => [])
  data.forEach((d, i) => {
    let positiveStack = baselineValues[i]
    let negativeStack = baselineValues[i]
    acs.forEach((a, j) => {
      const value = getValue(d, a) || 0
      if (!isNegativeStack[j]) {
        stackedData[j].push([positiveStack, positiveStack += value])
      } else {
        stackedData[j].push([negativeStack, negativeStack += value])
      }
    })
  })

  return stackedData
}

export function getExtent<Datum> (data: Datum[], ...acs: NumericAccessor<Datum>[]): number[] {
  return [getMin(data, ...acs), getMax(data, ...acs)]
}

export function getMin<Datum> (data: Datum[], ...acs: NumericAccessor<Datum>[]): number {
  const minValue = min(data, d => min(acs as NumericAccessor<Datum>[], a => getValue(d, a)))
  return minValue
}

export function getMax<Datum> (data: Datum[], ...acs: NumericAccessor<Datum>[]): number {
  const maxValue = max(data, d => max(acs as NumericAccessor<Datum>[], a => getValue(d, a)))
  return maxValue
}

export function getNearest<Datum> (data: Datum[], value: number, accessor: NumericAccessor<Datum>): Datum {
  if (data.length <= 1) return data[0]

  const values = data.map(d => getValue(d, accessor))
  values.sort((a, b) => a - b)

  const xBisector = bisector(d => d).left
  const index = xBisector(values, value, 1, data.length - 1)
  return value - values[index - 1] > values[index] - value ? data[index] : data[index - 1]
}

export function filterDataByRange<Datum> (data: Datum[], range: [number, number], accessor: NumericAccessor<Datum>) {
  const filteredData = data.filter(d => {
    const value = getValue(d, accessor)
    return (value >= range[0]) && (value < range[1])
  })

  return filteredData
}
