/** @unovis/mcp — programmatic API.
 *
 * The package is primarily a CLI (`unovis-mcp`), but the renderer and server
 * builder are exported for embedding:
 *
 *   import { renderChart, buildServer, recipes } from '@unovis/mcp'
 */
export { renderChart, ChartInputError } from './render/renderer.js'
export type { RenderOptions } from './render/renderer.js'
// The headless primitive: render any Unovis chart to standalone SVG in Node
export { renderToSvg } from './render/headless.js'
export type { HeadlessRenderOptions, BuildContext, RenderedChart, RenderResult } from './render/headless.js'
export { buildChartDocument, buildEmbedDocument } from './html/document.js'
export type { ChartDocumentOptions } from './html/document.js'
export { svgToPng, themeBackground } from './render/rasterize.js'
export type { RasterizeOptions } from './render/rasterize.js'
export type { ChartSpec, ComponentSpec, AxisSpec, AccessorRef, LegendItemSpec } from './render/spec.js'
export { recipes, recipeByName } from './recipes/index.js'
export type { Recipe, AnyRecipe } from './recipes/index.js'
export { buildServer } from './server.js'
export { registerTools, activeRecipes } from './tools/register.js'
export type { ToolFilterOptions } from './tools/register.js'
export { getRenderEnv } from './env/index.js'
export type { RenderEnv, UnovisLib } from './env/index.js'
