import { describe, expect, it } from 'vitest'
import { area, line } from 'd3-shape'

import { Curve, CurveType } from '@/types/curve'
import { interpolatePath } from './index'

describe('interpolatePath', () => {
  it('interpolates paths with different point counts in either direction', () => {
    const a = 'M0,0L10,10'
    const b = 'M10,10L20,20L30,30'
    expect(interpolatePath(a, b)(0.5)).toBe('M5,5L12.5,12.5L20,20')
    expect(interpolatePath(b, a)(0.5)).toBe('M5,5L12.5,12.5L20,20')
    expect(interpolatePath(a, b)(1)).toBe(b)
    expect(interpolatePath(b, a)(1)).toBe(a)
  })

  it.each([
    ['M0,0Q5,10,10,0', 'M0,0Q2.5,5,5,5Q7.5,5,10,0'],
    ['M0,0C0,10,10,10,10,0', 'M0,0C0,5,2.5,7.5,5,7.5C7.5,7.5,10,5,10,0'],
  ])('preserves the geometry of %s when subdividing', (a, b) => {
    const interpolate = interpolatePath(a, b)
    for (const t of [0, 0.25, 0.5, 0.75, 1]) expect(interpolate(t)).toBe(b)
  })

  it('converts straight segments to curves', () => {
    expect(interpolatePath('M0,0L10,10', 'M0,0C0,10,10,0,20,20')(0.5))
      .toBe('M0,0C5,10,10,5,15,15')
  })

  it('handles empty paths and paths containing only a move', () => {
    expect(interpolatePath('', '')(0.5)).toBe('')
    expect(interpolatePath(null, undefined)(0.5)).toBe('')
    expect(interpolatePath('', 'M10,20L30,40')(0.5)).toBe('M10,20L20,30')
    expect(interpolatePath('M10,20L30,40', '')(0.5)).toBe('M10,20L20,30')
    expect(interpolatePath('M10,20L30,40', '')(1)).toBe('')
    expect(interpolatePath('M10,20', 'M10,20L30,40')(0.5)).toBe('M10,20L20,30')
  })

  it('accepts negative numbers, decimals, and scientific notation', () => {
    expect(interpolatePath('M-1e-3,+.5L10,-20', 'M.001,-.5L20,-10')(0.5)).toBe('M0,0L15,-15')
  })

  it('keeps arc flags binary and interpolates the remaining arc parameters', () => {
    const interpolate = interpolatePath('M0,0A10,20,0,0,1,30,40', 'M0,0A20,30,90,1,0,50,60')
    expect(interpolate(0.25)).toBe('M0,0A12.5,22.5,22.5,0,1,35,45')
    expect(interpolate(0.75)).toBe('M0,0A17.5,27.5,67.5,1,0,45,55')
  })

  it('handles chord arcs when the number and type of segments change', () => {
    const a = 'M0,0L0,0'
    const b = 'M0,-10A10,10,0,0,1,10,0Q0,0,-10,0A10,10,0,0,1,0,-10Z'
    const interpolate = interpolatePath(a, b)
    expect(interpolate(0.5)).toBe('M0,-5A5,5,0,0,1,5,0Q0,0,-5,0A5,5,0,0,1,0,-5')
    expect(interpolate(1)).toBe(b)
    expect(interpolatePath(b, a)(0.5)).not.toMatch(/NaN|undefined|Infinity/)
  })

  it('retains closure only when both paths are closed, or one is empty', () => {
    expect(interpolatePath('M0,0L10,10Z', 'M0,0L20,20Z')(0.5)).toBe('M0,0L15,15Z')
    expect(interpolatePath('M0,0L10,10', 'M0,0L20,20Z')(0.5)).toBe('M0,0L15,15')
    expect(interpolatePath('', 'M0,0L20,20Z')(0.5)).toBe('M0,0L10,10Z')
  })

  it('keeps separate closed contours separate', () => {
    const a = 'M0,0L10,10ZM20,20L30,30Z'
    const b = 'M0,0L10,0L20,20ZM20,20L30,20L40,40Z'
    expect(interpolatePath(a, b)(0.5)).toBe('M0,0L7.5,2.5L15,15ZM20,20L27.5,22.5L35,35Z')
  })

  it('can restart an interrupted transition from its current geometry', () => {
    const a = 'M0,0C0,10,10,10,10,0'
    const b = 'M0,0L10,20L20,0L30,20'
    const interpolate = interpolatePath(a, b)
    const current = interpolate(0.3)
    expect(interpolatePath(current, b)(0)).toBe(current)
    expect(interpolatePath(current, b)(1)).toBe(b)
    interpolate(0.8)
    expect(interpolate(0.3)).toBe(current)
  })

  it.each(Object.values(CurveType))('supports generated %s paths as point counts and curve types change', (curveType) => {
    const curve = Curve[curveType]
    const data = (length: number): [number, number][] => Array.from({ length }, (_, i) => [i * 10, Math.sin(i) * 20])
    const lineGen = line<[number, number]>().curve(curve)
    const generators = [lineGen]
    if (curveType !== CurveType.Bundle) {
      generators.push(area<[number, number]>().x(d => d[0]).y0(0).y1(d => d[1]).curve(curve))
    }
    for (const generate of generators) {
      for (const sourceCount of [0, 1, 2, 5]) {
        for (const targetCount of [0, 1, 3, 8]) {
          const previous = generate(data(sourceCount)) || ''
          const next = generate(data(targetCount)) || ''
          for (const source of [previous, line<[number, number]>()(data(sourceCount)) || '']) {
            const interpolate = interpolatePath(source, next)
            for (const t of [0, 0.25, 0.5, 0.75, 1]) {
              const current = interpolate(t)
              expect(current).not.toMatch(/NaN|undefined|Infinity/)
              expect(() => interpolatePath(current, next)(0.5)).not.toThrow()
            }
            expect(interpolate(1)).toBe(next)
          }
        }
      }
    }
  })
})
