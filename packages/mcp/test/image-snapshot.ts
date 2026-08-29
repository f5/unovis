/** Pixel-based visual regression over text-stored baselines.
 *
 * Byte snapshots catch structural drift but not "this looks wrong", and they
 * churn on every harmless upstream attribute change (a font-weight attribute
 * once regenerated 16 files with zero visual difference). Comparing rendered
 * pixels inverts both properties — attribute noise disappears, visual changes
 * fail with a diff image a human can judge.
 *
 * The baseline stays an **SVG**, not a PNG: text delta-compresses in git and
 * reviews as a readable diff, while binaries would append near-full copies to
 * history on every update. Both sides rasterize through the same resvg
 * pipeline at compare time, so the comparison is pixels even though the
 * storage is text.
 *
 * Update baselines with UPDATE_IMAGES=1 (pnpm test:images:update), then
 * review the changed SVGs like any other diff.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

import { svgToPng, themeBackground } from '@unovis/ssr'

/** Elements whose inner whitespace is rendered — never reformat inside them */
const TEXT_CONTENT_ELEMENTS = new Set(['text', 'tspan', 'title', 'desc', 'style'])

/** One element per line, no indentation. Newline text nodes go only between
 * element-only children (inter-element whitespace is insignificant there),
 * and never inside text-content elements, where a stray newline renders as a
 * space. Parse-aware on purpose: a `>`+`<` string replace would corrupt `><`
 * sequences inside attribute values. No-indentation keeps diffs minimal —
 * indentation re-touches every descendant line when nesting depth shifts.
 * Idempotent, and pixel-identical to the compact form (asserted by a test). */
export function formatSvg (svg: string): string {
  const dom = new JSDOM(svg, { contentType: 'image/svg+xml' })
  const { document } = dom.window
  const walk = (el: Element): void => {
    if (TEXT_CONTENT_ELEMENTS.has(el.localName)) return
    const children = Array.from(el.childNodes)
    const elementsOnly = children.length > 0 && children.every(node =>
      node.nodeType === 1 || (node.nodeType === 3 && !(node.textContent ?? '').trim()))
    if (elementsOnly) {
      for (const node of children) {
        if (node.nodeType === 3) el.removeChild(node) // re-format: drop old separators
      }
      for (const child of Array.from(el.children)) {
        el.insertBefore(document.createTextNode('\n'), child)
        walk(child)
      }
      el.appendChild(document.createTextNode('\n'))
    } else {
      Array.from(el.children).forEach(walk)
    }
  }
  walk(document.documentElement)
  return new dom.window.XMLSerializer().serializeToString(document.documentElement)
}

const baselineDir = join(dirname(fileURLToPath(import.meta.url)), '__snapshots__')
const diffDir = join(dirname(fileURLToPath(import.meta.url)), '__image_diffs__')

export interface ImageMatch {
  /** Fraction of pixels allowed to differ (default 0.05%). Both sides
   * rasterize on the same machine with the same fonts, so the tolerance only
   * absorbs sub-pixel jitter from harmless baseline text drift — a recolored
   * 2px line (~0.5% of pixels) must fail */
  maxDiffRatio?: number;
  theme?: 'light' | 'dark';
}

export interface ImageMatchResult {
  ok: boolean;
  message: string;
}

/** Rasterize the render and its baseline SVG, compare as pixels */
export async function matchImageSnapshot (svg: string, name: string, options: ImageMatch = {}): Promise<ImageMatchResult> {
  const baselinePath = join(baselineDir, `${name}.svg`)

  const formatted = formatSvg(svg)
  if (process.env.UPDATE_IMAGES === '1' || !existsSync(baselinePath)) {
    mkdirSync(baselineDir, { recursive: true })
    writeFileSync(baselinePath, formatted)
    return { ok: true, message: `${name}: baseline written` }
  }

  const baselineSvg = readFileSync(baselinePath, 'utf8')
  // Identical text is identical pixels — skip the double rasterization
  if (baselineSvg === formatted) return { ok: true, message: `${name}: identical` }

  const background = themeBackground(options.theme ?? 'light')
  const [actualBuffer, expectedBuffer] = await Promise.all([
    svgToPng(svg, { scale: 1, background }),
    svgToPng(baselineSvg, { scale: 1, background }),
  ])
  const actual = PNG.sync.read(actualBuffer)
  const expected = PNG.sync.read(expectedBuffer)

  if (actual.width !== expected.width || actual.height !== expected.height) {
    return { ok: false, message: `${name}: size changed ${expected.width}×${expected.height} → ${actual.width}×${actual.height} (UPDATE_IMAGES=1 to accept)` }
  }

  const diff = new PNG({ width: actual.width, height: actual.height })
  // threshold is pixelmatch's per-pixel color sensitivity; antialiased pixels
  // are excluded so platform AA differences don't count as changes
  const differing = pixelmatch(expected.data, actual.data, diff.data, actual.width, actual.height, { threshold: 0.1 })
  const ratio = differing / (actual.width * actual.height)
  const maxRatio = options.maxDiffRatio ?? 0.0005

  if (ratio > maxRatio) {
    mkdirSync(diffDir, { recursive: true })
    writeFileSync(join(diffDir, `${name}.actual.svg`), formatted)
    writeFileSync(join(diffDir, `${name}.actual.png`), actualBuffer)
    writeFileSync(join(diffDir, `${name}.diff.png`), PNG.sync.write(diff))
    return { ok: false, message: `${name}: ${(ratio * 100).toFixed(2)}% of pixels differ (allowed ${(maxRatio * 100).toFixed(2)}%) — actual and diff written to test/__image_diffs__ (UPDATE_IMAGES=1 to accept)` }
  }
  return { ok: true, message: `${name}: ${(ratio * 100).toFixed(3)}% differ, within tolerance` }
}
