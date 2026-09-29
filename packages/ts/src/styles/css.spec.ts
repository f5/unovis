import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const NONCE = 'test-nonce-abc123'
// eslint-disable-next-line @typescript-eslint/naming-convention
const globals = globalThis as { UNOVIS_NONCE?: string }

const getStyleElements = (): NodeListOf<HTMLStyleElement> => document.head.querySelectorAll<HTMLStyleElement>('style[data-unovis]')
const getCssRules = (): string[] => Array.from(getStyleElements()).flatMap(el => Array.from(el.sheet?.cssRules ?? [], rule => rule.cssText))

describe('css runtime (jsdom)', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    globals.UNOVIS_NONCE = undefined
    getStyleElements().forEach(n => n.remove())
  })

  it('applies globalThis.UNOVIS_NONCE to the injected style tag', async () => {
    globals.UNOVIS_NONCE = NONCE
    const { injectGlobal } = await import('./css')
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    injectGlobal`.__unovis_nonce_test__ { color: red; }`

    const tags = getStyleElements()
    expect(tags.length).toBe(1)
    expect(tags[0].getAttribute('nonce')).toBe(NONCE)
  })

  it('omits the nonce attribute when UNOVIS_NONCE is unset', async () => {
    const { injectGlobal } = await import('./css')
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    injectGlobal`.__unovis_nonce_absent__ { color: blue; }`

    const tags = getStyleElements()
    expect(tags.length).toBe(1)
    expect(tags[0].hasAttribute('nonce')).toBe(false)
  })

  it('names classes after their labels and inserts identical styles once', async () => {
    const { css } = await import('./css')
    const className = css`
      label: legend-item;
      color: ${'red'};
    `
    const sameClassName = css`
      label: legend-item;
      color: ${'red'};
    `

    expect(className).toMatch(/^unovis-[0-9a-z]+-legend-item$/)
    expect(sameClassName).toBe(className)
    expect(getCssRules()).toEqual([`.${className} { color: red; }`])
  })

  it('attaches nested rules with & and joins interpolated arrays without commas', async () => {
    const { css } = await import('./css')
    const className = css`
      label: item;
      ${['opacity: 1;', 'cursor: pointer;']}
      &:hover { opacity: 0.5; }
      span { color: red; }
    `

    expect(getCssRules()).toEqual([
      `.${className} { opacity: 1; cursor: pointer; }`,
      `.${className}:hover { opacity: 0.5; }`,
      `.${className} span { color: red; }`,
    ])
  })

  it('ends interpolated array items with ; and keeps properties that end with "label"', async () => {
    const { css } = await import('./css')
    const className = css`
      label: tooltip;
      --vis-tooltip-label: 10px;
      ${['color: red', 'background: blue']}
    `

    expect(className).toMatch(/^unovis-[0-9a-z]+-tooltip$/)
    expect(getCssRules()).toEqual([`.${className} { --vis-tooltip-label: 10px; color: red; background: blue; }`])
  })

  it('accepts plain strings and objects in injectGlobal', async () => {
    const { injectGlobal } = await import('./css')
    injectGlobal('.__unovis_string__ { color: red; }')
    injectGlobal({
      ':root': { '--vis-test-color': 'red', '--vis-test-size': 12, '--vis-test-unset': undefined },
      '.__unovis_object__': [{ '--vis-a': '1' }, { '--vis-b': '2' }],
    })

    expect(getCssRules()).toEqual([
      '.__unovis_string__ { color: red; }',
      ':root { --vis-test-color: red; --vis-test-size: 12; }',
      '.__unovis_object__ { --vis-a: 1; --vis-b: 2; }',
    ])
  })

  it('inserts identical global styles once', async () => {
    const { injectGlobal } = await import('./css')
    injectGlobal('.__unovis_global__ { color: red; }')
    injectGlobal('.__unovis_global__ { color: red; }')

    expect(getCssRules()).toEqual(['.__unovis_global__ { color: red; }'])
  })

  it('adds the -webkit- prefix Safari needs for user-select', async () => {
    const { css } = await import('./css')
    const className = css`user-select: none;`

    expect(getCssRules()).toEqual([`.${className} { -webkit-user-select: none; user-select: none; }`])
  })
})
