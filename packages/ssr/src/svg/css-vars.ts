/** CSS custom-property baking for standalone SVG output.
 *
 * The rendered DOM references theme values as `var(--vis-*)` (in inline
 * styles and presentation attributes). Standalone SVG viewers — and PNG
 * rasterizers — can't be relied on to support custom properties, so every
 * `var()` reference is resolved to a literal value.
 */
import type { VarMaps } from '../env/computed-style.js'

export interface VarContext {
  maps: VarMaps;
  theme: 'light' | 'dark';
  /** Highest-priority overrides (e.g. a custom palette) */
  overrides?: Map<string, string>;
}

const VAR_PATTERN = /var\(\s*(--[\w-]+)\s*(?:,([^()]*(?:\([^()]*\)[^()]*)*))?\)/

export function lookupVar (name: string, el: Element | null, ctx: VarContext): string | undefined {
  // Inline definitions on the element chain win (matches browser behavior)
  let node: Element | null = el
  while (node) {
    const inline = (node as HTMLElement | SVGElement).style?.getPropertyValue(name)
    if (inline) return inline
    node = node.parentElement
  }
  if (ctx.overrides?.has(name)) return ctx.overrides.get(name)
  if (ctx.theme === 'dark' && ctx.maps.dark.has(name)) return ctx.maps.dark.get(name)
  return ctx.maps.light.get(name)
}

export function substituteVarsForElement (value: string, el: Element | null, ctx: VarContext, depth = 0): string {
  if (depth > 10) return value
  let result = value
  let match: RegExpExecArray | null
  while ((match = VAR_PATTERN.exec(result))) {
    const [full, name, fallback] = match
    const resolvedRaw = lookupVar(name, el, ctx)
    const replacement = resolvedRaw !== undefined
      ? substituteVarsForElement(resolvedRaw, el, ctx, depth + 1)
      : (fallback !== undefined ? substituteVarsForElement(fallback.trim(), el, ctx, depth + 1) : '')
    result = result.slice(0, match.index) + replacement + result.slice(match.index + full.length)
  }
  return result
}

/** Attributes that commonly carry var() references or url() functions.
 * font-family included: the core's text renderer emits
 * `font-family="var(--vis-font-family)"` as a presentation attribute. */
const PAINT_ATTRS = ['fill', 'stroke', 'color', 'stop-color', 'marker', 'marker-start', 'marker-mid', 'marker-end', 'mask', 'filter', 'stroke-dasharray', 'flood-color', 'font-family']

export function bakeCssVars (svg: SVGSVGElement, ctx: VarContext): void {
  const elements = [svg, ...Array.from(svg.querySelectorAll('*'))]
  for (const el of elements) {
    const style = (el as SVGElement).style
    if (style && style.length !== undefined) {
      const props = Array.from({ length: style.length }, (_, i) => style.item(i))
      for (const prop of props) {
        const value = style.getPropertyValue(prop)
        if (!value) continue
        if (prop.startsWith('--')) continue // custom-prop definitions are dropped below
        if (value.includes('var(')) {
          style.setProperty(prop, substituteVarsForElement(value, el, ctx), style.getPropertyPriority(prop))
        }
      }
      // Drop custom-property definitions after all references were resolved
      for (const prop of props) {
        if (prop.startsWith('--')) style.removeProperty(prop)
      }
    }
    for (const attr of PAINT_ATTRS) {
      const value = el.getAttribute(attr)
      if (value && value.includes('var(')) {
        el.setAttribute(attr, substituteVarsForElement(value, el, ctx))
      }
    }
  }
}
