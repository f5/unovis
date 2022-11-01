import _isUndefined from 'lodash-es/isUndefined.js'
import _isArray from 'lodash-es/isArray.js'
import _isEmpty from 'lodash-es/isEmpty.js'
import _isEqual from 'lodash-es/isEqual.js'
import _isNil from 'lodash-es/isNil.js'
import _cloneDeep from 'lodash-es/cloneDeep.js'
import _throttle from 'lodash-es/throttle.js'
import _each from 'lodash-es/each.js'
import _filter from 'lodash-es/filter.js'
import _get from 'lodash-es/get.js'
import _without from 'lodash-es/without.js'
import _find from 'lodash-es/find.js'
import _findIndex from 'lodash-es/findIndex.js'
import _isString from 'lodash-es/isString.js'
import _isObject from 'lodash-es/isObject.js'
import _isFunction from 'lodash-es/isFunction.js'
import _isNumber from 'lodash-es/isNumber.js'
import _merge from 'lodash-es/merge.js'
import _isPlainObject from 'lodash-es/isPlainObject.js'
import _flatten from 'lodash-es/flatten.js'
import _omit from 'lodash-es/omit.js'
import _extend from 'lodash-es/extend.js'
import _groupBy from 'lodash-es/groupBy.js'
import _sortBy from 'lodash-es/sortBy.js'
import _range from 'lodash-es/range.js'
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
export const sortBy = _sortBy
export const range = _range

export function getValue<T, ReturnType> (
  d: T,
  accessor: NumericAccessor<T> | StringAccessor<T> | BooleanAccessor<T> | ColorAccessor<T> | GenericAccessor<ReturnType, T>,
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

export function unique<T> (array: T[]): T[] {
  return Array.from(new Set(array))
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
    data.forEach((d, i) => {
      let positiveStack = 0
      let negativeStack = 0
      for (const a of acs as NumericAccessor<Datum>[]) {
        const value = getNumber(d, a, i) || 0
        if (value >= 0) positiveStack += value
        else negativeStack += value
      }

      if (positiveStack > maxValue) maxValue = positiveStack
      if (negativeStack < minValue) minValue = negativeStack
    })
    return [minValue, maxValue]
  }
}

export function getStackedValues<Datum> (d: Datum, index: number, ...acs: NumericAccessor<Datum>[]): (number | undefined)[] {
  const values = []

  let positiveStack = 0
  let negativeStack = 0
  for (const a of acs as NumericAccessor<Datum>[]) {
    const value = getNumber(d, a, index) || 0
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
  const baselineValues = data.map((d, i) => getNumber(d, baseline, i) || 0)
  const isNegativeStack = acs.map((a, j) => {
    const average = mean(data, (d, i) => getNumber(d, a, i) || 0)
    return (average === 0 && Array.isArray(prevNegative)) ? prevNegative[j] : average < 0
  })

  const stackedData: StackValuesRecord[] = acs.map(() => [])
  data.forEach((d, i) => {
    let positiveStack = baselineValues[i]
    let negativeStack = baselineValues[i]
    acs.forEach((a, j) => {
      const value = getNumber(d, a, i) || 0
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

export function getMin<Datum> (data: Datum[], ...acs: NumericAccessor<Datum>[]): number | undefined {
  if (!data) return undefined
  const minValue = min(data, (d, i) => min(acs as NumericAccessor<Datum>[], a => getNumber(d, a, i)))
  return minValue
}

export function getMax<Datum> (data: Datum[], ...acs: NumericAccessor<Datum>[]): number | undefined {
  if (!data) return undefined
  const maxValue = max(data, (d, i) => max(acs as NumericAccessor<Datum>[], a => getNumber(d, a, i)))
  return maxValue
}

export function getExtent<Datum> (data: Datum[], ...acs: NumericAccessor<Datum>[]): (number | undefined)[] {
  return [getMin(data, ...acs), getMax(data, ...acs)]
}

export function getNearest<Datum> (data: Datum[], value: number, accessor: NumericAccessor<Datum>): Datum {
  if (data.length <= 1) return data[0]

  const values = data.map((d, i) => getNumber(d, accessor, i))
  values.sort((a, b) => a - b)

  const xBisector = bisector(d => d).left
  const index = xBisector(values, value, 1, data.length - 1)
  return value - values[index - 1] > values[index] - value ? data[index] : data[index - 1]
}

export function filterDataByRange<Datum> (data: Datum[], range: [number, number], accessor: NumericAccessor<Datum>): Datum[] {
  const filteredData = data.filter((d, i) => {
    const value = getNumber(d, accessor, i)
    return (value >= range[0]) && (value < range[1])
  })

  return filteredData
}

export function isNumberWithinRange (value: number, range: [number, number]): boolean {
  return (value >= range[0]) && (value <= range[1])
}
