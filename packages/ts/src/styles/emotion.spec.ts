import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const NONCE = 'test-nonce-abc123'
// eslint-disable-next-line @typescript-eslint/naming-convention
const globals = globalThis as { UNOVIS_NONCE?: string }

describe('emotion nonce (jsdom)', () => {
  beforeEach(() => {
    vi.resetModules()
    globals.UNOVIS_NONCE = NONCE
  })

  afterEach(() => {
    globals.UNOVIS_NONCE = undefined
    document.head.querySelectorAll('style[data-emotion]').forEach(n => n.remove())
  })

  it('applies globalThis.UNOVIS_NONCE to injected style tags', async () => {
    const { injectGlobal } = await import('./emotion')
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    injectGlobal`.__unovis_nonce_test__ { color: red; }`

    const tags = document.head.querySelectorAll<HTMLStyleElement>('style[data-emotion^="unovis"]')
    expect(tags.length).toBeGreaterThan(0)
    for (const tag of tags) {
      expect(tag.getAttribute('nonce')).toBe(NONCE)
    }
  })

  it('falls back to the default css- prefix and omits the nonce attribute when UNOVIS_NONCE is unset', async () => {
    globals.UNOVIS_NONCE = undefined
    vi.resetModules()

    const { injectGlobal } = await import('./emotion')
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    injectGlobal`.__unovis_nonce_absent__ { color: blue; }`

    const tags = document.head.querySelectorAll<HTMLStyleElement>('style[data-emotion^="css"]')
    expect(tags.length).toBeGreaterThan(0)
    for (const tag of tags) {
      expect(tag.hasAttribute('nonce')).toBe(false)
    }
  })
})
