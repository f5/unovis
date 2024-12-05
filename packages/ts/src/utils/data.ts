import { max, min, mean, bisector } from 'd3-array'
import { throttle as _throttle } from 'throttle-debounce'

// Types
import { NumericAccessor, StringAccessor, BooleanAccessor, ColorAccessor, GenericAccessor } from 'types/accessor'
import { StackValuesRecord } from 'types/data'

export const isNumber = <T>(a: T): a is T extends number ? T : never => typeof a === 'number'
// eslint-disable-next-line @typescript-eslint/ban-types
export const isFunction = <T>(a: T): a is T extends Function ? T : never => typeof a === 'function'
export const isUndefined = <T>(a: T): a is T extends undefined ? T : never => a === undefined
export const isNil = <T>(a: T): a is null | undefined => a == null
export const isString = <T>(a: T): a is T extends string ? T : never => typeof a === 'string'
export const isArray = <T>(a: T): a is T extends any[] ? T : never => Array.isArray(a)
export const isObject = <T>(a: T): boolean => (a instanceof Object)
export const isAClassInstance = <T>(a: T): boolean => a.constructor.name !== 'Function' && a.constructor.name !== 'Object'
export const isPlainObject = <T>(a: T): boolean => isObject(a) && !isArray(a) && !isFunction(a) && !isAClassInstance(a)

export const isEmpty = <T>(obj: T): boolean => {
  return [Object, Array].includes((obj || {}).constructor as ArrayConstructor | ObjectConstructor) &&
    !Object.entries((obj || {})).length
}

// Based on https://github.com/maplibre/maplibre-gl-js/blob/e78ad7944ef768e67416daa4af86b0464bd0f617/src/style-spec/util/deep_equal.ts, 3-Clause BSD license
export const isEqual = (
  a: unknown | null | undefined,
  b: unknown | null | undefined,
  skipKeys: string[] = [],
  visited: Set<any> = new Set()
): boolean => {
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false

    if (visited.has(a)) return true
    else visited.add(a)

    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i], skipKeys, visited)) return false
    }

    return true
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }

  if (typeof a === 'object' && a !== null && b !== null) {
    if (!(typeof b === 'object')) return false
    if (a === b) return true

    const keysA = Object.keys(a).filter(key => !skipKeys.includes(key))
    const keysB = Object.keys(b).filter(key => !skipKeys.includes(key))

    if (keysA.length !== keysB.length) return false

    if (visited.has(a)) return true
    else visited.add(a)

    for (const key of keysA) {
      if (!isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], skipKeys, visited)) return false
    }

    return true
  }

  return a === b
}

export const without = <T>(arr: Array<T>, ...args: T[]): Array<T> => arr.filter(item => !args.includes(item))
export const flatten = <T>(arr: Array<T | T[]>): Array<T> => arr.flat() as T[]
export const cloneDeep = <T>(obj: T, stack: Map<any, any> = new Map()): T => {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  if (obj instanceof Array) {
    const clone: unknown[] = []
    stack.set(obj, clone)
    for (const item of obj) {
      clone.push(stack.has(item) ? stack.get(item) : cloneDeep(item, stack))
    }
    return clone as unknown as T
  }

  // Class instances will be copied without cloning
  if (isAClassInstance(obj)) {
    const clone = obj
    return clone
  }

  if (obj instanceof Object) {
    const clone = {} as T
    stack.set(obj, clone)
    const objAsRecord = obj as Record<string | number, unknown>
    Object.keys(obj)
      .reduce((newObj: typeof objAsRecord, key: string | number): typeof objAsRecord => {
        newObj[key] = stack.has(objAsRecord[key]) ? stack.get(objAsRecord[key]) : cloneDeep(objAsRecord[key], stack)
        return newObj
      }, clone as typeof objAsRecord)

    return clone
  }

  return obj
}


export const merge = <T, K>(obj1: T, obj2: K, visited: Map<any, any> = new Map()): T & K => {
  type Rec = Record<string | number, unknown>

  if (!obj1 || !obj2) return obj1 as T & K
  if ((obj1 as unknown) === (obj2 as unknown)) return obj1 as T & K

  const newObj = (isAClassInstance(obj1 as Rec) ? obj1 : cloneDeep(obj1)) as T & K

  // Taking care of recursive structures
  if (visited.has(obj2)) return visited.get(obj2)
  else visited.set(obj2, newObj)

  Object.keys(obj2 as Rec).forEach(key => {
    // Preventing prototype pollution
    if (key === '__proto__' || key === 'constructor') return

    if (isPlainObject((obj1 as Rec)[key]) && isPlainObject((obj2 as Rec)[key])) {
      (newObj as Rec)[key] = merge((obj1 as Rec)[key], (obj2 as Rec)[key], visited)
    } else if (isAClassInstance(obj2 as Rec)) {
      (newObj as Rec)[key] = obj2
    } else {
      (newObj as Rec)[key] = cloneDeep((obj2 as Rec)[key])
    }
  })

  return newObj
}

export const omit = <T extends Record<string | number | symbol, unknown>>(obj: T, props: Array<keyof T>): Partial<T> => {
  obj = { ...obj }
  props.forEach(prop => delete obj[prop])
  return obj
}

export const groupBy = <T extends Record<string | number, any>> (arr: T[], accessor: (a: T) => string | number): Record<string | number, T[]> => {
  return arr.reduce(
    (grouped, v, i, a, k = accessor(v)) => (((grouped[k] || (grouped[k] = [])).push(v), grouped)),
    {} as Record<string | number, T[]>
  )
}

export const sortBy = <T>(arr: Array<T>, accessor: (a: T) => string | number): Array<T> => {
  return arr.concat() // The native sort method modifies the array in place. We use `.concat()` to copy the array first
    .sort((a, b): number => {
      return (accessor(a) > accessor(b)) ? 1 : ((accessor(b) > accessor(a)) ? -1 : 0)
    })
}

export const throttle = <T extends (...args: any[]) => any>(
  f: T,
  delay: number,
  options?: {
    noTrailing?: boolean;
    noLeading?: boolean;
    debounceMode?: boolean;
  }
): _throttle<T> => _throttle(delay, f, options)

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

export function countUnique<T> (array: T[], accessor = (d: unknown) => d): number {
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
    return (value >= range[0]) && (value <= range[1])
  })

  return filteredData
}

export function isNumberWithinRange (value: number, range: [number, number]): boolean {
  return (value >= range[0]) && (value <= range[1])
}
