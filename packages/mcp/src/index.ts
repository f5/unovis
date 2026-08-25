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
// Re-exported from @unovis/ssr, where the headless renderer now lives —
// existing imports from '@unovis/mcp' keep working
export { renderToSvg } from '@unovis/ssr'
export type { HeadlessRenderOptions, BuildContext, RenderedChart, RenderResult } from '@unovis/ssr'
export { buildChartDocument, buildEmbedDocument } from './html/document.js'
export type { ChartDocumentOptions } from './html/document.js'
export { svgToPng, themeBackground } from '@unovis/ssr'
export type { RasterizeOptions } from '@unovis/ssr'
export { SPEC_VERSION } from './render/spec.js'
export type { ChartSpec, ComponentSpec, AxisSpec, AccessorRef, LegendItemSpec } from './render/spec.js'
export { recipes, recipeByName } from './recipes/index.js'
export type { Recipe, AnyRecipe } from './recipes/index.js'
export { buildServer } from './server.js'
export { registerTools, activeRecipes } from './tools/register.js'
export type { ToolFilterOptions } from './tools/register.js'
export { getRenderEnv } from '@unovis/ssr'
export type { RenderEnv, UnovisLib } from '@unovis/ssr'
export { generateCode, formatGeneratedFiles, FRAMEWORKS } from './codegen/index.js'
export type { Framework, GeneratedFile } from './codegen/index.js'
