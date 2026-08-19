import { describe, expect, it } from 'vitest'
import { toPx } from '@/utils/to-px'

// Runs with no window/document — guards against regressions in the SSR fallback path
describe('toPx (ssr)', () => {
  it('does not throw when window/document are undefined', () => {
    expect(typeof window).toBe('undefined')
    expect(() => toPx('12px')).not.toThrow()
  })

  it('falls back to sensible defaults for absolute units', () => {
    expect(toPx('12px')).toBe(12)
    expect(toPx('1em')).toBe(16)
    expect(toPx('1in')).toBe(96)
  })

  it('returns null for empty input', () => {
    expect(toPx('')).toBeNull()
  })
})
