import { describe, expect, it } from 'vitest'
import { toPx } from '@/utils/to-px'

describe('toPx (jsdom)', () => {
  it('converts px unit to a number', () => {
    expect(toPx('12px')).toBe(12)
  })

  it('resolves em relative to the body font size', () => {
    document.body.style.fontSize = '20px'
    expect(toPx('2em')).toBe(40)
  })

  it('returns null for empty input', () => {
    expect(toPx('')).toBeNull()
    expect(toPx(null)).toBeNull()
    expect(toPx(undefined)).toBeNull()
  })
})
