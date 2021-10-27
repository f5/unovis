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
import { NumericAccessor, StringAccessor, BooleanAccessor, ColorAccessor, GenericAccessor } from 'types/accessor'
import { StackValuesRecord } from 'types/data'

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

export function getValue<T, ReturnType> (
  d: T,
  accessor: NumericAccessor<T> | StringAccessor<T> | BooleanAccessor<T> | ColorAccessor<T> | GenericAccessor<T, ReturnType>,
  index?: number
): ReturnType {
  // eslint-disable-next-line @typescript-eslint/ban-types
  if (isFunction(accessor)) return (accessor as Function)(d, index) as (ReturnType | null | undefined)
  else return accessor as unknown as (ReturnType | null | undefined)
}

export function getString<T> (d: T, accessor: StringAccessor<T>, i?: number): string | null | undefined {
  return getValue<T, string>(d, accessor, i)
}

export function getNumber<T> (d: T, accessor: NumericAccessor<T>, i?: number): number | null | undefined {
  return getValue<T, number>(d, accessor, i)
}

export function getBoolean<T> (d: T, accessor: BooleanAccessor<T>, i?: number): boolean | null | undefined {
  return getValue<T, boolean>(d, accessor, i)
}

export function clean<T> (data: T[]): T[] {
  return data.filter(d => d && !isNumber(d))
}

export function clamp (d: number, min: number, max: number): number {
  return Math.min(Math.max(d, min), max)
}

export function countUnique<T> (array: T[], accessor = d => d): number {
  return new Set(array.map(d => accessor(d))).size
}

export function arrayOfIndices (n: number): number[] {
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

export function getStackedExtent<Datum> (data: Datum[], ...acs: NumericAccessor<Datum>[]): (number | undefined)[] {
  if (!data) return [undefined, undefined]
  if (isArray(acs)) {
    let minValue = 0
    let maxValue = 0
    for (const d of data) {
      let positiveStack = 0
      let negativeStack = 0
      for (const a of acs as NumericAccessor<Datum>[]) {
        const value = getNumber(d, a) || 0
        if (value >= 0) positiveStack += value
        else negativeStack += value
      }

      if (positiveStack > maxValue) maxValue = positiveStack
      if (negativeStack < minValue) minValue = negativeStack
    }
    return [minValue, maxValue]
  }
}

export function getStackedValues<Datum> (d: Datum, ...acs: NumericAccessor<Datum>[]): (number | undefined)[] {
  const values = []

  let positiveStack = 0
  let negativeStack = 0
  for (const a of acs as NumericAccessor<Datum>[]) {
    const value = getNumber(d, a) || 0
    if (value >= 0) {
      values.push(positiveStack += value)
    } else {
      values.push(negativeStack += value)
    }
  }

  return values
}

export function getStackedData<Datum> (
  data: Datum[],
  baseline: NumericAccessor<Datum>,
  acs: NumericAccessor<Datum>[],
  prevNegative?: boolean[] // to help guessing the stack direction (positive/negative) when the values are 0 or null
): StackValuesRecord[] {
  const baselineValues = data.map(d => getNumber(d, baseline) || 0)
  const isNegativeStack = acs.map((a, i) => {
    const average = mean(data, d => getNumber(d, a) || 0)
    return (average === 0 && Array.isArray(prevNegative)) ? prevNegative[i] : average < 0
  })

  const stackedData: StackValuesRecord[] = acs.map(() => [])
  data.forEach((d, i) => {
    let positiveStack = baselineValues[i]
    let negativeStack = baselineValues[i]
    acs.forEach((a, j) => {
      const value = getNumber(d, a) || 0
      if (!isNegativeStack[j]) {
        stackedData[j].push([positiveStack, positiveStack += value])
      } else {
        stackedData[j].push([negativeStack, negativeStack += value])
      }
    })
  })

  // Fill in additional stack information
  stackedData.forEach((stack, i) => {
    stack.negative = isNegativeStack[i]
  })

  stackedData.filter(s => s.negative)
    .forEach((s, i, arr) => {
      s.ending = i === arr.length - 1
    })

  stackedData.filter(s => !s.negative)
    .forEach((s, i, arr) => {
      s.ending = i === arr.length - 1
    })

  return stackedData
}

export function getExtent<Datum> (data: Datum[], ...acs: NumericAccessor<Datum>[]): (number | undefined)[] {
  return [getMin(data, ...acs), getMax(data, ...acs)]
}

export function getMin<Datum> (data: Datum[], ...acs: NumericAccessor<Datum>[]): number | undefined {
  if (!data) return undefined
  const minValue = min(data, d => min(acs as NumericAccessor<Datum>[], a => getNumber(d, a)))
  return minValue
}

export function getMax<Datum> (data: Datum[], ...acs: NumericAccessor<Datum>[]): number | undefined {
  if (!data) return undefined
  const maxValue = max(data, d => max(acs as NumericAccessor<Datum>[], a => getNumber(d, a)))
  return maxValue
}

export function getNearest<Datum> (data: Datum[], value: number, accessor: NumericAccessor<Datum>): Datum {
  if (data.length <= 1) return data[0]

  const values = data.map(d => getNumber(d, accessor))
  values.sort((a, b) => a - b)

  const xBisector = bisector(d => d).left
  const index = xBisector(values, value, 1, data.length - 1)
  return value - values[index - 1] > values[index] - value ? data[index] : data[index - 1]
}

export function filterDataByRange<Datum> (data: Datum[], range: [number, number], accessor: NumericAccessor<Datum>): Datum[] {
  const filteredData = data.filter(d => {
    const value = getNumber(d, accessor)
    return (value >= range[0]) && (value < range[1])
  })

  return filteredData
}

export function isNumberWithinRange (value: number, range: [number, number]): boolean {
  return (value >= range[0]) && (value <= range[1])
}
