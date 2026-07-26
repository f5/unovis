/** `getComputedStyle` wrapper for jsdom.
 *
 * Unovis resolves its theming through CSS custom properties
 * (`getCSSVariableValue` → `getComputedStyle(el).getPropertyValue('--vis-*')`)
 * and reads font information for text measurement
 * (`utils/text-measure.ts#getFontInfo`). jsdom neither cascades custom
 * properties from stylesheets nor resolves fonts, so this wrapper:
 *
 *  - resolves `--*` properties from the element's inline-style chain, then
 *    from a variable map parsed out of the emotion-injected stylesheets
 *    (with dark-theme overrides applied when the dark theme is active)
 *  - synthesizes font properties (size/family/weight/style) from element
 *    attributes, inline styles, and Unovis defaults, resolving `var()`
 *    references in the values
 */
import type { DOMWindow } from 'jsdom'

export interface VarMaps {
  light: Map<string, string>;
  dark: Map<string, string>;
}

const FALLBACK_FONT_FAMILY = 'Inter, Arial, "Helvetica Neue", Helvetica, sans-serif'
const FALLBACK_FONT_SIZE = '12px'

let varMaps: VarMaps = { light: new Map(), dark: new Map() }

/** Stylesheet rules that declare font properties, in source order.
 * jsdom doesn't cascade these into computed styles, so we match them
 * manually with `el.matches(selector)` — CSS must beat presentation
 * attributes (e.g. the tick-label font-size vs d3-axis's font-size="10"
 * group attribute). */
interface FontRule { selector: string; declarations: Map<string, string> }
let fontRules: FontRule[] = []

export function setVarMaps (maps: VarMaps): void {
  varMaps = maps
}

export function setFontRules (rules: { selector: string; block: string }[]): void {
  fontRules = []
  for (const rule of rules) {
    if (!rule.block.includes('font-')) continue
    if (rule.selector.startsWith('@')) continue
    const declarations = new Map<string, string>()
    for (const match of rule.block.matchAll(/(font-(?:size|family|weight|style))\s*:\s*([^;}]+)/g)) {
      declarations.set(match[1], match[2].trim())
    }
    if (declarations.size) fontRules.push({ selector: rule.selector, declarations })
  }
}

function matchFontRules (el: Element, prop: string): string | undefined {
  let value: string | undefined
  for (const rule of fontRules) {
    const declared = rule.declarations.get(prop)
    if (declared === undefined) continue
    try {
      if (el.matches(rule.selector)) value = declared // later rules win, like source order
    } catch { /* selector not supported by jsdom */ }
  }
  return value
}

export function getVarMaps (): VarMaps {
  return varMaps
}

/** Matches the selectors in @unovis/ts utils/theme.ts */
export function isDarkThemeActive (document: Document): boolean {
  const html = document.documentElement
  const body = document.body
  return html?.getAttribute('data-theme') === 'dark' ||
    html?.classList.contains('dark-theme') || html?.classList.contains('theme-dark') ||
    body?.classList.contains('dark-theme') || body?.classList.contains('theme-dark')
}

/** Substitute var(--name[, fallback]) references in a CSS value using the active maps */
export function substituteVars (value: string, document: Document, depth = 0): string {
  if (depth > 10 || !value.includes('var(')) return value
  const dark = isDarkThemeActive(document)
  return value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*|[^()]*\([^()]*\)[^()]*))?\)/g, (_, name: string, fallback?: string) => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const resolved = lookupVar(name, dark)
    if (resolved !== undefined) return substituteVars(resolved, document, depth + 1)
    return fallback !== undefined ? substituteVars(fallback.trim(), document, depth + 1) : ''
  })
}

function lookupVar (name: string, dark: boolean): string | undefined {
  if (dark && varMaps.dark.has(name)) return varMaps.dark.get(name)
  return varMaps.light.get(name)
}

/** Resolve a custom property for an element: inline chain first, then the theme maps */
export function resolveCssVar (name: string, el: Element | null, document: Document): string {
  let node: Element | null = el
  while (node) {
    const style = (node as HTMLElement | SVGElement).style
    const inline = style?.getPropertyValue(name)
    if (inline) return substituteVars(inline, document)
    node = node.parentElement
  }
  const value = lookupVar(name, isDarkThemeActive(document))
  return value !== undefined ? substituteVars(value, document) : ''
}

function resolveFontProp (el: Element, prop: 'font-size' | 'font-family' | 'font-weight' | 'font-style', cssValue: string, document: Document): string {
  // Inline style on the element itself has the highest priority
  const ownInline = (el as SVGElement | HTMLElement).style?.getPropertyValue(prop)
  if (ownInline) return substituteVars(ownInline, document).trim()

  // A value from jsdom's own cascade wins next — resolve any var() refs in it
  if (cssValue) {
    const resolved = substituteVars(cssValue, document).trim()
    if (resolved) return resolved
  }

  // Stylesheet rules matched manually (self, then ancestors — CSS inherits)
  let node: Element | null = el
  while (node) {
    const matched = matchFontRules(node, prop)
    if (matched) return substituteVars(matched, document).trim()
    node = node.parentElement
  }

  // Then presentation attributes and inline styles up the ancestor chain
  node = el
  while (node && node.namespaceURI?.endsWith('svg')) {
    const attr = node.getAttribute(prop)
    if (attr) return substituteVars(attr, document).trim()
    const inline = (node as SVGElement).style?.getPropertyValue(prop)
    if (inline) return substituteVars(inline, document).trim()
    node = node.parentElement
  }
  switch (prop) {
    case 'font-size': return FALLBACK_FONT_SIZE
    case 'font-family': return substituteVars(lookupVar('--vis-font-family', false) ?? FALLBACK_FONT_FAMILY, document)
    default: return 'normal'
  }
}

/** Resolve the CSS font shorthand used for canvas text measurement */
export function resolveFontShorthand (el: Element, document: Document): { font: string; fontSizePx: number } {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const style = tryNativeComputedStyle(el, document)
  const fontSize = resolveFontProp(el, 'font-size', style?.fontSize ?? '', document)
  const fontFamily = resolveFontProp(el, 'font-family', style?.fontFamily ?? '', document)
  const fontWeight = resolveFontProp(el, 'font-weight', style?.fontWeight ?? '', document)
  const fontStyle = resolveFontProp(el, 'font-style', style?.fontStyle ?? '', document)
  const fontSizePx = parseFloat(fontSize) || 12
  return { font: `${fontStyle} ${fontWeight} ${fontSizePx}px ${fontFamily}`, fontSizePx }
}

let nativeGetComputedStyle: ((el: Element, pseudo?: string | null) => CSSStyleDeclaration) | undefined

function tryNativeComputedStyle (el: Element, document: Document): CSSStyleDeclaration | undefined {
  try {
    return nativeGetComputedStyle?.(el)
  } catch {
    return undefined
  }
}

export function installComputedStyle (window: DOMWindow): void {
  const document = window.document
  nativeGetComputedStyle = window.getComputedStyle.bind(window)

  const wrapped = (el: Element, pseudo?: string | null): CSSStyleDeclaration => {
    const target = nativeGetComputedStyle!(el, pseudo)
    return new Proxy(target, {
      get (t, prop, receiver) {
        if (prop === 'getPropertyValue') {
          return (name: string): string => {
            if (name.startsWith('--')) return resolveCssVar(name, el, document)
            const value = t.getPropertyValue(name)
            if (/^font/.test(name)) return resolveFontProp(el, name as 'font-size', value, document)
            return value.includes('var(') ? substituteVars(value, document) : value
          }
        }
        if (prop === 'fontSize') return resolveFontProp(el, 'font-size', t.fontSize, document)
        if (prop === 'fontFamily') return resolveFontProp(el, 'font-family', t.fontFamily, document)
        if (prop === 'fontWeight') return resolveFontProp(el, 'font-weight', t.fontWeight, document)
        if (prop === 'fontStyle') return resolveFontProp(el, 'font-style', t.fontStyle, document)
        const value = Reflect.get(t, prop, t)
        return typeof value === 'function' ? value.bind(t) : value
      },
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).getComputedStyle = wrapped
}
