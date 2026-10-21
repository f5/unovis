import { describe, expect, it } from 'vitest'
import { scaleLinear } from 'd3-scale'
import { cloneDeep, getNearest2D, isAClassInstance, merge } from '@/utils/data'

type Datum = { x: number; a: number }

describe('getNearest2D', () => {
  it('reads the stacked values with the datum index', () => {
    const data: Datum[] = [{ x: 0, a: 1 }, { x: 1, a: 2 }, { x: 2, a: 3 }]
    const scale = scaleLinear()
    const yStacked = [(d: Datum, i: number) => i === 2 ? d.a : undefined]

    const nearest = getNearest2D(data, [2, 3], scale, scale, d => d.x, [], yStacked)
    expect(nearest?.index).toBe(2)
  })
})

describe('isAClassInstance', () => {
  class Foo {}

  it('detects class instances', () => {
    expect(isAClassInstance(new Foo())).toBe(true)
    expect(isAClassInstance(new Date())).toBe(true)
  })

  it('returns false for plain objects and functions', () => {
    expect(isAClassInstance({})).toBe(false)
    expect(isAClassInstance(() => 1)).toBe(false)
  })

  it('returns false for values without a constructor', () => {
    expect(isAClassInstance(Object.create(null))).toBe(false)
    expect(isAClassInstance(null)).toBe(false)
    expect(isAClassInstance(undefined)).toBe(false)
  })
})

describe('null-prototype objects', () => {
  const createNullProtoObject = (): Record<string, unknown> => {
    const obj = Object.create(null) as Record<string, unknown>
    obj.a = 1
    return obj
  }

  it('are not treated as class instances and can be cloned', () => {
    const obj = createNullProtoObject()

    expect(() => cloneDeep({ obj })).not.toThrow()
    expect(cloneDeep({ obj }).obj).toBe(obj)
  })

  it('can be merged as a config value', () => {
    const obj = createNullProtoObject()
    let result: { b: number; obj: Record<string, unknown> } | undefined

    expect(() => { result = merge({ b: 2 }, { obj }) }).not.toThrow()
    expect(result?.b).toBe(2)
    expect(result?.obj.a).toBe(1)
  })
})
