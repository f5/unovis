/** Headless rendering environment for @unovis/ts.
 *
 * Creates a single shared jsdom window, installs every browser API the
 * library needs (in the right order — some are captured at module load),
 * and only then dynamically imports '@unovis/ts'. Import order matters:
 *
 *  - emotion inserts real <style> tags only if `document` exists at import
 *  - utils/text-measure snapshots a canvas 2D context at module scope
 *  - d3-timer binds `window.requestAnimationFrame` at module load
 */
import { JSDOM } from 'jsdom'
import type { DOMWindow } from 'jsdom'

import { RafQueue } from './raf-queue.js'
import { installCanvasHook } from './canvas.js'
import { installBBoxPolyfills } from './bbox.js'
import { installComputedStyle, setVarMaps, setFontRules } from './computed-style.js'
import type { VarMaps } from './computed-style.js'
import { collectCssRules } from '../svg/collect-css.js'

export { defineElementSize } from './size.js'

export type UnovisLib = typeof import('@unovis/ts')

export interface RenderEnv {
  window: DOMWindow;
  document: Document;
  lib: UnovisLib;
  raf: RafQueue;
  varMaps: VarMaps;
}

/* eslint-disable @typescript-eslint/no-empty-function */
class NoopResizeObserver {
  observe (): void {}
  unobserve (): void {}
  disconnect (): void {}
}
/* eslint-enable @typescript-eslint/no-empty-function */

function exposeGlobals (window: DOMWindow, raf: RafQueue): void {
  const globalNames = [
    'document', 'location', 'navigator',
    'Element', 'HTMLElement', 'SVGElement', 'SVGGraphicsElement', 'HTMLCanvasElement',
    'Node', 'Text', 'DOMParser', 'XMLSerializer', 'MutationObserver',
    'CSS', 'DOMPoint', 'DOMRect', 'getComputedStyle',
  ]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any
  g.window = window
  for (const name of globalNames) {
    if (!(name in window)) continue
    try {
      Object.defineProperty(g, name, { configurable: true, get: () => window[name] })
    } catch { /* some globals (e.g. navigator on newer Node) may resist redefinition */ }
  }
  g.requestAnimationFrame = raf.request
  g.cancelAnimationFrame = raf.cancel
  g.ResizeObserver = NoopResizeObserver
}

/** Parse all emotion-injected CSS custom properties into light/dark maps */
function buildVarMapsFromRules (rules: ReturnType<typeof collectCssRules>): VarMaps {
  const light = new Map<string, string>()
  const dark = new Map<string, string>()
  const darkSelector = /dark-theme|theme-dark|\[data-theme="?dark"?\]/

  for (const rule of rules) {
    const isDark = darkSelector.test(rule.selector)
    // Only :root-scoped declarations are global defaults. Class-scoped
    // custom-property overrides (e.g. styleLargeSize from styles/sizes.ts)
    // must not leak into the global maps.
    if (!isDark && !rule.selector.includes(':root')) continue
    for (const match of rule.block.matchAll(/(--[\w-]+)\s*:\s*([^;}]+)/g)) {
      const [, name, value] = match
      ;(isDark ? dark : light).set(name, value.trim())
    }
  }

  // The dark palette remap (--vis-colorN → --vis-dark-colorN) is declared
  // under selectors jsdom can't apply; reproduce it here.
  for (const [name, value] of light) {
    const darkEquivalent = name.replace(/^--vis-color(\d+)$/, '--vis-dark-color$1')
    if (darkEquivalent !== name && light.has(darkEquivalent)) {
      if (!dark.has(name)) dark.set(name, light.get(darkEquivalent) as string)
    }
    if (/^--vis-dark-/.test(name)) {
      const lightName = name.replace('--vis-dark-', '--vis-')
      if (!dark.has(lightName)) dark.set(lightName, value)
    }
  }
  return { light, dark }
}

let envPromise: Promise<RenderEnv> | undefined

export function getRenderEnv (): Promise<RenderEnv> {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  if (!envPromise) envPromise = createEnv()
  return envPromise
}

async function createEnv (): Promise<RenderEnv> {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/',
    pretendToBeVisual: false,
  })
  const window = dom.window
  const raf = new RafQueue()

  // Install shims before the library import — several APIs are captured
  // at module scope inside @unovis/ts and its dependencies.
  window.requestAnimationFrame = raf.request as DOMWindow['requestAnimationFrame']
  window.cancelAnimationFrame = raf.cancel
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).ResizeObserver = NoopResizeObserver
  installCanvasHook(window)
  installBBoxPolyfills(window)
  installComputedStyle(window)
  exposeGlobals(window, raf)

  const lib: UnovisLib = await import('@unovis/ts')

  const cssRules = collectCssRules(window.document)
  const varMaps = buildVarMapsFromRules(cssRules)
  // Unovis estimates text width as chars × fontSize × ratio (default 0.5) when
  // reserving label space, but trims against real canvas metrics — Inter runs
  // wider (~0.55), so marginal labels would get clipped. A slightly generous
  // ratio makes reservations always cover measured text.
  varMaps.light.set('--vis-font-wh-ratio', '0.58')
  setVarMaps(varMaps)
  setFontRules(cssRules)

  return { window, document: window.document, lib, raf, varMaps }
}
