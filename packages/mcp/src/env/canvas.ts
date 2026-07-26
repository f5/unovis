/** Canvas 2D support for text measurement.
 *
 * `@unovis/ts` snapshots `document.createElement('canvas').getContext('2d')`
 * at module load (utils/text-measure.ts) and uses `ctx.measureText` for all
 * precise text measurement. jsdom has no canvas backend, so we patch
 * `HTMLCanvasElement.prototype.getContext` to hand out a real 2D context from
 * @napi-rs/canvas (prebuilt Skia, no postinstall scripts).
 *
 * Fonts: any .ttf/.otf files in the package's `fonts/` directory are
 * registered so text metrics match the font declared in the output
 * (Unovis defaults to Inter). Without font files, system fonts are used —
 * metrics are close but not exact.
 */
import { createCanvas, GlobalFonts } from '@napi-rs/canvas'
import type { SKRSContext2D } from '@napi-rs/canvas'
import { readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { DOMWindow } from 'jsdom'

let sharedContext: SKRSContext2D | undefined

export function getSharedContext (): SKRSContext2D {
  if (!sharedContext) sharedContext = createCanvas(512, 128).getContext('2d')
  return sharedContext
}

export function registerBundledFonts (): string[] {
  const registered: string[] = []
  const fontsDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'fonts')
  let entries: string[] = []
  try {
    entries = readdirSync(fontsDir)
  } catch {
    return registered
  }

  for (const file of entries) {
    if (!/\.(ttf|otf|woff2?)$/i.test(file)) continue
    // Font family is derived from the file name: "Inter-Regular.ttf" → "Inter"
    const family = file.replace(/\.(ttf|otf|woff2?)$/i, '').split('-')[0]
    if (GlobalFonts.registerFromPath(join(fontsDir, file), family)) registered.push(file)
  }
  return registered
}

/** Measure text width with the shared context. `font` is a CSS font shorthand. */
export function measureTextWidth (text: string, font: string): number {
  const ctx = getSharedContext()
  if (ctx.font !== font) ctx.font = font
  return ctx.measureText(text).width
}

export function installCanvasHook (window: DOMWindow): void {
  registerBundledFonts()
  const proto = window.HTMLCanvasElement.prototype as { getContext: (type: string) => unknown }
  proto.getContext = function (type: string) {
    return type === '2d' ? getSharedContext() : null
  }
}
