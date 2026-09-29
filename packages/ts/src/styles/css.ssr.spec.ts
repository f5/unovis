import { describe, expect, it } from 'vitest'
import { css, injectGlobal } from '@/styles/css'

// Runs with no window/document — guards against regressions in the SSR fallback path
describe('css runtime (ssr)', () => {
  it('returns class names and skips style insertion when document is undefined', () => {
    expect(typeof document).toBe('undefined')
    expect(css`label: ssr-test; color: red;`).toMatch(/^unovis-[0-9a-z]+-ssr-test$/)
    expect(() => injectGlobal`.__unovis_ssr__ { color: red; }`).not.toThrow()
  })
})
