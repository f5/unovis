import { describe, expect, it } from 'vitest'
import { line } from 'd3-shape'
import { path } from 'd3-path'

import { curveSmoothStep, SmoothStepDirection } from './index'

describe('curveSmoothStep', () => {
  it.each<[SmoothStepDirection, string]>([
    [SmoothStepDirection.Down, 'M0,0L0,20L0,35Q0,40,5,40L95,40Q100,40,100,45L100,60L100,80'],
    [SmoothStepDirection.Up, 'M0,0L0,-15Q0,-20,5,-20L45,-20Q50,-20,50,-15L50,95Q50,100,55,100L95,100Q100,100,100,95L100,80'],
    [SmoothStepDirection.Right, 'M0,0L20,0L45,0Q50,0,50,5L50,75Q50,80,55,80L80,80L100,80'],
    [SmoothStepDirection.Left, 'M0,0L-15,0Q-20,0,-20,5L-20,35Q-20,40,-15,40L115,40Q120,40,120,45L120,75Q120,80,115,80L100,80'],
  ])('preserves the smooth-step path with a fixed %s direction', (direction, expected) => {
    expect(line().curve(curveSmoothStep.direction(direction))([[0, 0], [100, 80]])).toBe(expected)
  })

  it.each<[number, number, SmoothStepDirection]>([
    [20, -100, SmoothStepDirection.Up],
    [20, 100, SmoothStepDirection.Down],
    [-100, 20, SmoothStepDirection.Left],
    [100, 20, SmoothStepDirection.Right],
    [-100, -100, SmoothStepDirection.Left],
    [100, -100, SmoothStepDirection.Right],
    [0, 0, SmoothStepDirection.Right],
  ])('automatically routes displacement (%s, %s) toward %s', (dx, dy, direction) => {
    const points: [number, number][] = [[30, 40], [30 + dx, 40 + dy]]
    const configured = curveSmoothStep.radius(12).offset(30)
    expect(line().curve(configured.direction(SmoothStepDirection.Auto))(points))
      .toBe(line().curve(configured.direction(direction))(points))
  })

  it('recalculates auto direction for each segment and call, ignoring control points', () => {
    const generator = line().defined(point => Number.isFinite(point[0])).curve(curveSmoothStep.direction(SmoothStepDirection.Auto))
    const up: [number, number][] = [[0, 0], [20, -100]]
    const right: [number, number][] = [[0, 0], [100, 20]]
    const down: [number, number][] = [[0, 0], [20, 100]]
    const expected = (points: [number, number][], direction: SmoothStepDirection): string => line().curve(curveSmoothStep.direction(direction))(points)

    expect(generator(up)).toBe(expected(up, SmoothStepDirection.Up))
    expect(generator([right[0], [-500, -300], [500, 300], right[1]])).toBe(expected(right, SmoothStepDirection.Right))
    expect(generator(down)).toBe(expected(down, SmoothStepDirection.Down))
    expect(generator([...up, [NaN, NaN], ...right, [NaN, NaN], ...down]))
      .toBe(`${expected(up, SmoothStepDirection.Up)}${expected(right, SmoothStepDirection.Right)}${expected(down, SmoothStepDirection.Down)}`)
    expect(generator([])).toBeNull()
    expect(generator([[1, 2]])).toBe('M1,2')
  })

  it('keeps the exit direction when the target crosses the source', () => {
    const generator = line().curve(curveSmoothStep.direction(SmoothStepDirection.Up))
    expect(generator([[0, 0], [100, -80]])).toMatch(/^M0,0L0,-20/)
    expect(generator([[0, 0], [100, 80]])).toMatch(/^M0,0L0,-15Q0,-20/)
  })

  it('routes only the endpoints, independently of intermediate control points', () => {
    const generator = line().curve(curveSmoothStep)
    expect(generator([[0, 0], [500, -300], [-400, 200], [100, 80]]))
      .toBe(generator([[0, 0], [100, 80]]))
  })

  it('resets between defined segments and repeated calls', () => {
    const generator = line().defined(point => Number.isFinite(point[0])).curve(curveSmoothStep)
    const a: [number, number][] = [[0, 0], [100, 80]]
    const b: [number, number][] = [[20, 40], [80, 100]]
    expect(generator([...a, [NaN, NaN], ...b])).toBe(`${generator(a)}${generator(b)}`)
    expect(generator([])).toBeNull()
    expect(generator([[1, 2]])).toBe('M1,2')
  })

  it('handles aligned, duplicate and coincident points without invalid coordinates', () => {
    const generator = line().curve(curveSmoothStep)
    expect(generator([[0, 0], [0, 80]])).toBe('M0,0L0,20L0,40L0,60L0,80')
    expect(generator([[0, 0], [0, 0], [100, 80], [100, 80]]))
      .toBe(generator([[0, 0], [100, 80]]))
    expect(generator([[0, 0], [0, 0]])).toBe('M0,0L0,20L0,-20L0,0')
  })

  it('clamps corner rounding to half the adjacent segment lengths', () => {
    const generator = line().curve(curveSmoothStep.radius(100).offset(0))
    expect(generator([[0, 0], [10, 10]])).toBe('M0,0L0,2.5Q0,5,2.5,5L7.5,5Q10,5,10,7.5L10,10')
  })

  it('supports a drawing context and independent factory settings', () => {
    const context = path()
    const configured = curveSmoothStep.radius(0).offset(30).direction(SmoothStepDirection.Left)
    const points: [number, number][] = [[0, 0], [100, 80]]
    line().curve(configured).context(context)(points)
    expect(context.toString()).toBe(line().curve(configured)(points))
    expect(context.toString()).toContain('L-30,0')
    expect(line().curve(curveSmoothStep)(points)).toContain('Q0,40,5,40')
  })
})
