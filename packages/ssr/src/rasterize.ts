/** SVG → PNG rasterization via @resvg/resvg-js.
 *
 * The post-processed SVG is fully self-contained (styles inlined as
 * attributes, no classes, no var(), no external refs) — exactly what resvg
 * handles well. Text is shaped with the same provisioned Inter fonts used
 * for measurement, so PNG output matches the measured layout.
 *
 * resvg ignores the CSS `background-color` style on the root (it's not an
 * SVG rendering attribute), so the theme background is passed explicitly.
 */
import { ensureFontsDir } from './env/fonts.js'

export interface RasterizeOptions {
  /** CSS pixel width of the SVG (defaults to the width attribute) */
  width?: number;
  /** Pixel density multiplier (2 = retina). Default 2 */
  scale?: number;
  /** Background color; PNG has no page to inherit one from */
  background?: string;
}

export async function svgToPng (svg: string, options: RasterizeOptions = {}): Promise<Buffer> {
  const resvgModule = await import('@resvg/resvg-js')

  const scale = options.scale ?? 2
  const width = options.width ?? parseFloat(/width="([\d.]+)"/.exec(svg)?.[1] ?? '') ?? undefined
  const fontsDir = await ensureFontsDir()

  const resvg = new resvgModule.Resvg(svg, {
    fitTo: width ? { mode: 'width', value: Math.round(width * scale) } : { mode: 'original' },
    background: options.background,
    font: {
      fontDirs: fontsDir ? [fontsDir] : [],
      defaultFontFamily: 'Inter',
      loadSystemFonts: true,
    },
  })
  return Buffer.from(resvg.render().asPng())
}

export const themeBackground = (theme: 'light' | 'dark'): string =>
  theme === 'dark' ? '#292b34' : '#ffffff'
