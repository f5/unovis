/** Turn a rendered chart's live SVG element into a standalone SVG string.
 *
 * The rendered DOM depends on the page context: emotion classes reference
 * stylesheet rules, colors are `var(--vis-*)` references, url(#) refs may be
 * absolute, ids are random guids. This pipeline makes the SVG self-contained:
 *
 *  1. import externally-injected defs that the chart references
 *  2. inline matched stylesheet declarations as inline styles (classes are
 *     dropped afterwards — survives sanitizers, <img> embedding, rasterizers)
 *  3. bake every var() reference into a literal value (theme-aware)
 *  4. synthesize the title/legend header
 *  5. rewrite ids with a deterministic prefix and normalize url() refs
 *  6. root hygiene: dimensions, viewBox, role, font-family, cleanup
 */
import { collectCssRules } from './collect-css.js'
import { bakeCssVars, substituteVarsForElement } from './css-vars.js'
import type { VarContext } from './css-vars.js'
import { importExternalDefs, rewriteIds } from './ids.js'
import { renderHeader } from './header.js'
import type { LegendItemSpec } from './header.js'
import type { VarMaps } from '../env/computed-style.js'

/** What the output frame needs to know about a chart — deliberately not a
 * ChartSpec, so the SVG layer stays independent of the spec format. */
export interface SvgFrame {
  width: number;
  height: number;
  theme?: 'light' | 'dark';
  /** Rendered as a heading above the chart */
  title?: string;
  /** Rendered as swatch + label rows under the title */
  legend?: LegendItemSpec[];
  /** Palette overriding --vis-colorN */
  colors?: string[];
}

export interface FinalizeContext {
  document: Document;
  frame: SvgFrame;
  varMaps: VarMaps;
  /** Deterministic id prefix (tests); random per render by default */
  idPrefix?: string;
  /** Keep emotion class attributes and skip style inlining (debug) */
  keepClasses?: boolean;
  /** Frame padding; defaults to CHART_PADDING */
  padding?: { top: number; right: number; bottom: number; left: number };
}

const PSEUDO_SELECTOR = /:(hover|focus|active|visited|checked|disabled)|::/

/** Frame around the chart so content never touches the image edges.
 * The requested width/height are the final image size — the renderer draws
 * the chart at the inner size and the content is offset here. */
export const CHART_PADDING = { top: 12, right: 16, bottom: 16, left: 16 }

export function finalizeSvg (svg: SVGSVGElement, ctx: FinalizeContext): string {
  const { document, frame } = ctx
  const spec = frame
  const padding = ctx.padding ?? CHART_PADDING

  const overrides = new Map<string, string>()
  spec.colors?.forEach((color, i) => {
    overrides.set(`--vis-color${i}`, color)
    overrides.set(`--vis-dark-color${i}`, color)
  })
  const varCtx: VarContext = { maps: ctx.varMaps, theme: spec.theme ?? 'light', overrides }

  importExternalDefs(svg, document)

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  if (!ctx.keepClasses) inlineStyles(svg, document, varCtx)

  bakeCssVars(svg, varCtx)

  const fontFamily = substituteVarsForElement('var(--vis-font-family)', null, varCtx) ||
    'Inter, Arial, "Helvetica Neue", Helvetica, sans-serif'

  // Frame the chart: wrap the rendered content and offset it by the padding
  // (and below the synthesized header). width/height stay the requested size.
  const width = spec.width
  const contentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  while (svg.firstChild) contentGroup.appendChild(svg.firstChild)
  svg.appendChild(contentGroup)

  const headerHeight = renderHeader(svg, document, {
    title: spec.title,
    legend: spec.legend,
    fontFamily,
  }, varCtx, width)
  contentGroup.setAttribute('transform', `translate(${padding.left},${headerHeight + padding.top})`)

  rewriteIds(svg, ctx.idPrefix ?? `uv${Math.random().toString(36).slice(2, 6)}-`)

  // Root hygiene
  const totalHeight = spec.height + headerHeight
  svg.setAttribute('width', String(width))
  svg.setAttribute('height', String(totalHeight))
  svg.setAttribute('viewBox', `0 0 ${width} ${totalHeight}`)
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svg.removeAttribute('aria-hidden')
  svg.setAttribute('role', 'img')
  svg.style.removeProperty('display')
  svg.style.setProperty('font-family', fontFamily)
  if (spec.theme === 'dark') svg.style.setProperty('background-color', '#292b34')

  if (spec.title) {
    const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title')
    titleEl.textContent = spec.title
    svg.prepend(titleEl)
  }

  if (!ctx.keepClasses) {
    for (const el of [svg, ...Array.from(svg.querySelectorAll('*'))]) {
      el.removeAttribute('class')
      el.removeAttribute('animating')
      if (el.getAttribute('style') === '') el.removeAttribute('style')
    }
  }

  return new ctx.document.defaultView!.XMLSerializer().serializeToString(svg)
}

/** Apply matched stylesheet declarations as inline styles.
 * jsdom's querySelectorAll does the selector matching; declarations never
 * override author inline styles, while later rules override earlier ones.
 * var() references are resolved at write time — jsdom's typed CSS properties
 * (e.g. opacity) would otherwise mangle them into "NaN". */
function inlineStyles (svg: SVGSVGElement, document: Document, varCtx: VarContext): void {
  const ruleApplied = new WeakMap<Element, Set<string>>()

  for (const rule of collectCssRules(document)) {
    if (rule.selector.includes(':root') || PSEUDO_SELECTOR.test(rule.selector)) continue

    let matches: Element[]
    try {
      matches = [
        ...(svg.matches(rule.selector) ? [svg] : []),
        ...Array.from(svg.querySelectorAll(rule.selector)),
      ]
    } catch {
      continue
    }
    if (!matches.length) continue

    const declarations: [string, string][] = []
    for (const match of rule.block.matchAll(/(--[\w-]+|[a-zA-Z-]+)\s*:\s*([^;]+)/g)) {
      const prop = match[1].trim()
      if (prop === 'label') continue // emotion debug labels
      declarations.push([prop, match[2].trim()])
    }
    if (!declarations.length) continue

    for (const el of matches) {
      const style = (el as SVGElement).style
      if (!style) continue
      let applied = ruleApplied.get(el)
      if (!applied) {
        applied = new Set()
        ruleApplied.set(el, applied)
      }
      for (const [prop, value] of declarations) {
        const existing = style.getPropertyValue(prop)
        if (existing && !applied.has(prop)) continue // author inline style wins
        const resolved = !prop.startsWith('--') && value.includes('var(')
          ? substituteVarsForElement(value, el, varCtx)
          : value
        style.setProperty(prop, resolved)
        applied.add(prop)
      }
    }
  }
}
