import { describe, expect, it } from 'vitest'
import { parseUnit } from '@/utils/misc'

describe('parseUnit', () => {
  it('parses numbers, pixels and percentages', () => {
    expect(parseUnit(12)).toBe(12)
    expect(parseUnit('12px')).toBe(12)
    expect(parseUnit('25%', 200)).toBe(50)
    expect(parseUnit(undefined)).toBe(0)
  })

  it('evaluates calc() expressions', () => {
    expect(parseUnit('calc(100% - 20px)', 200)).toBe(180)
    expect(parseUnit('calc(50% + 2 * 10px)', 200)).toBe(120)
    expect(parseUnit('calc((100% - 20px) / 2)', 200)).toBe(90)
    expect(parseUnit('calc(-10px + 30px)', 0)).toBe(20)
    expect(parseUnit('calc(10px - 30px)', 0)).toBe(-20)
  })

  it('evaluates calc() with a negative right operand after subtraction', () => {
    expect(parseUnit('calc(100% - 2 * (10px - 30px))', 200)).toBe(240)
    expect(parseUnit('calc(10px - 2 * -3)', 0)).toBe(16)
    expect(parseUnit('calc(20 - 4 / -2)', 0)).toBe(22)
  })

  it('evaluates calc() with leading-dot decimals', () => {
    expect(parseUnit('calc(.5 * 100%)', 200)).toBe(100)
    expect(parseUnit('calc(100% * .25)', 200)).toBe(50)
    expect(parseUnit('calc(.5% + 10px)', 200)).toBe(11)
  })
})
