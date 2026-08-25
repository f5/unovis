/** @unovis/ssr — server-side rendering for Unovis.
 *
 * A headless browser environment (jsdom plus the shims Unovis needs) and one
 * primitive on top of it: `renderToSvg`, which turns hand-written Unovis code
 * into a standalone SVG — no browser, no remote services. `svgToPng`
 * rasterizes the result.
 */
export { renderToSvg } from './headless.js'
export type { HeadlessRenderOptions, BuildContext, RenderedChart, RenderResult } from './headless.js'
export { svgToPng, themeBackground } from './rasterize.js'
export type { RasterizeOptions } from './rasterize.js'
export type { LegendItemSpec } from './svg/header.js'
export { getRenderEnv } from './env/index.js'
export type { RenderEnv, UnovisLib } from './env/index.js'

// The building blocks, for consumers that host Unovis in their own jsdom
// (e.g. executing a browser bundle in tests) rather than through renderToSvg
export { installBBoxPolyfills } from './env/bbox.js'
export { installCanvasHook, measureTextWidth } from './env/canvas.js'
export { installComputedStyle } from './env/computed-style.js'
export { RafQueue } from './env/raf-queue.js'
export { defineElementSize } from './env/size.js'
