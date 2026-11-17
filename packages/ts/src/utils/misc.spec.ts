import { describe, expect, it, vi } from 'vitest'

import { parseUnit } from '@/utils/misc'

describe('parseUnit', () => {
  it.each<{ input: `calc(${string})`; basis: number; expected: number }>([
    { input: 'calc(100% - 2 * (10px - 30px))', basis: 200, expected: 240 },
    { input: 'calc(10px - 2 * -3)', basis: 0, expected: 16 },
    { input: 'calc(20 - 4 / -2)', basis: 0, expected: 22 },
    { input: 'calc(.5 * 100%)', basis: 200, expected: 100 },
    { input: 'calc(100% * .25)', basis: 200, expected: 50 },
    { input: 'calc(.5% + 10px)', basis: 200, expected: 11 },
    { input: 'calc(10px - 2 * 0)', basis: 0, expected: 10 },
    { input: 'calc(0.0000001 * 2 + 3)', basis: 0, expected: 3.0000002 },
    { input: 'calc(48 / 6 / 2 + 7 - 3 - 1)', basis: 0, expected: 7 },
    { input: 'calc(-2 * (3 - (4 + 5)))', basis: 0, expected: 12 },
    { input: 'calc(2 * -.5px)', basis: 0, expected: -1 },
    { input: 'calc(1px - 10%)', basis: -20, expected: 3 },
    { input: 'calc(1% + 3)', basis: 0.00001, expected: 3.0000001 },
  ])('evaluates $input to $expected', ({ input, basis, expected }) => {
    expect(parseUnit(input, basis)).toBe(expected)
  })

  it('resolves plain numbers, pixels and percentages', () => {
    expect(parseUnit(12)).toBe(12)
    expect(parseUnit('-.5px')).toBe(-0.5)
    expect(parseUnit('.5%', 200)).toBe(1)
  })

  it.each<{ input: `calc(${string})`; basis?: number }>([
    { input: 'calc(10px +)' },
    { input: 'calc(10px / (50% - 50%))', basis: 200 },
    { input: 'calc(1 / 0)' },
    { input: 'calc(-1 / 0)' },
    { input: 'calc(0 / 0)' },
  ])('warns and returns zero for $input', ({ input, basis }) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    try {
      expect(parseUnit(input, basis)).toBe(0)
      expect(warn).toHaveBeenCalledOnce()
    } finally {
      warn.mockRestore()
    }
  })
})
