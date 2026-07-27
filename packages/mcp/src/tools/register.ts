/** Bind chart recipes to MCP tools. */
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, isAbsolute, join } from 'node:path'

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

import { recipes } from '../recipes/index.js'
import type { AnyRecipe } from '../recipes/index.js'
import { renderChart, resolveMapMarkers, ChartInputError } from '../render/renderer.js'
import { svgToPng, themeBackground } from '../render/rasterize.js'
import { buildChartDocument } from '../html/document.js'
import { generateCode, formatGeneratedFiles } from '../codegen/index.js'
import type { Framework } from '../codegen/index.js'
import type { ChartSpec } from '../render/spec.js'

export interface ToolFilterOptions {
  /** Tool names to hide (env DISABLED_TOOLS / --disable-tools) */
  disabledTools?: string[];
  /** When set, only these tools are exposed (--tools) */
  enabledTools?: string[];
}

/** MCP UI resource the interactive output binds to (registered in server.ts) */
export const WIDGET_URI = 'ui://unovis/chart'

const textResult = (text: string, isError = false): CallToolResult =>
  ({ content: [{ type: 'text', text }], ...(isError ? { isError: true } : {}) })

/** Map data lives behind a `{ $unovisMap }` marker that only the Node renderer
 * resolves — the browser widget has no map bundles, so bake it into the spec */
async function specForBrowser (spec: ChartSpec): Promise<ChartSpec> {
  return { ...spec, components: await resolveMapMarkers(spec.components) }
}

const chartSummary = (spec: ChartSpec): string =>
  `${spec.title ?? spec.components.map(c => c.type).join(' + ')} (${spec.width}×${spec.height}, ${spec.theme} theme)`

async function runRecipe (recipe: AnyRecipe, input: Record<string, unknown>): Promise<CallToolResult> {
  try {
    const spec = recipe.toSpec(input)

    if (input.outputType === 'config') {
      return textResult(JSON.stringify(spec, null, 2))
    }

    // Code: emit source for the chosen wrapper. Uses the unresolved spec so
    // map data stays an import rather than an inlined payload.
    if (input.outputType === 'code') {
      const files = generateCode(spec, (input.framework as Framework | undefined) ?? 'ts')
      return textResult(formatGeneratedFiles(files))
    }

    // Interactive: hand the spec to a UI-capable client, which renders it with
    // the widget resource. Static content stays in the transcript as a summary.
    if (input.outputType === 'interactive') {
      const browserSpec = await specForBrowser(spec)
      return {
        content: [{ type: 'text', text: `Interactive chart: ${chartSummary(spec)}` }],
        structuredContent: { spec: browserSpec as unknown as Record<string, unknown> },
        _meta: { 'openai/outputTemplate': WIDGET_URI },
      }
    }

    const isHtml = input.outputType === 'html'
    const isPng = input.outputType === 'png'
    const extension = isHtml ? '.html' : isPng ? '.png' : '.svg'
    const outputPath = input.outputPath as string | undefined
    if (outputPath && (!isAbsolute(outputPath) || !outputPath.endsWith(extension))) {
      return textResult(`outputPath must be an absolute path ending in ${extension} (matching outputType), got: ${outputPath}`, true)
    }

    // Self-contained interactive document. Always written to disk: the inlined
    // widget bundle is far too large to put in a tool result.
    if (isHtml) {
      const html = buildChartDocument(await specForBrowser(spec))
      const target = outputPath ?? join(mkdtempSync(join(tmpdir(), 'unovis-chart-')), 'chart.html')
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, html)
      return textResult(`Interactive chart saved to ${target} — open it in a browser for tooltips, ` +
        `crosshair and hover highlighting. ${chartSummary(spec)}`)
    }

    const result = await renderChart(spec)
    const warningsNote = result.warnings.length ? ` (warnings: ${result.warnings.join('; ')})` : ''

    if (isPng) {
      const png = await svgToPng(result.svg, {
        width: result.width,
        scale: (input.scale as number | undefined) ?? 2,
        background: themeBackground(spec.theme),
      })
      if (outputPath) {
        mkdirSync(dirname(outputPath), { recursive: true })
        writeFileSync(outputPath, png)
        return textResult(`Chart saved to ${outputPath} (${result.width}×${result.height} at ${input.scale ?? 2}x)${warningsNote}`)
      }
      return {
        content: [
          { type: 'image', data: png.toString('base64'), mimeType: 'image/png' },
          ...(warningsNote ? [{ type: 'text' as const, text: warningsNote.trim() }] : []),
        ],
      }
    }

    if (outputPath) {
      mkdirSync(dirname(outputPath), { recursive: true })
      writeFileSync(outputPath, `<?xml version="1.0" encoding="UTF-8"?>\n${result.svg}`)
      return textResult(`Chart saved to ${outputPath} (${result.width}×${result.height})${warningsNote}`)
    }

    return textResult(result.svg + (result.warnings.length ? `\n<!-- warnings: ${result.warnings.join('; ')} -->` : ''))
  } catch (e) {
    if (e instanceof ChartInputError) {
      return textResult(`Invalid input for ${recipe.name}: ${e.message}`, true)
    }
    return textResult(`Failed to render ${recipe.name}: ${e instanceof Error ? e.message : String(e)}`, true)
  }
}

export function activeRecipes (filter: ToolFilterOptions = {}): AnyRecipe[] {
  const disabled = new Set(filter.disabledTools ?? [])
  const enabled = filter.enabledTools?.length ? new Set(filter.enabledTools) : undefined
  return recipes.filter(r => !disabled.has(r.name) && (!enabled || enabled.has(r.name)))
}

export function registerTools (server: McpServer, filter: ToolFilterOptions = {}): void {
  for (const recipe of activeRecipes(filter)) {
    server.registerTool(
      recipe.name,
      {
        title: recipe.title,
        description: recipe.description,
        inputSchema: recipe.inputShape,
        annotations: {
          readOnlyHint: false, // outputPath can write a file
          openWorldHint: false, // fully local, no network
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (args: any) => runRecipe(recipe, args)
    )
  }

  server.registerTool(
    'get_unovis_info',
    {
      title: 'Unovis info',
      description: 'Get information about this Unovis chart server: available chart tools, default color palette, themes and output modes.',
      inputSchema: {},
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => textResult(JSON.stringify({
      library: 'Unovis (https://unovis.dev)',
      rendering: 'local headless SVG — no browser, no remote services',
      tools: activeRecipes(filter).map(r => ({ name: r.name, title: r.title })),
      themes: ['light', 'dark'],
      outputTypes: ['svg', 'png', 'html', 'interactive', 'config', 'code'],
      frameworks: ['ts', 'react', 'svelte', 'vue', 'angular', 'solid'],
      interactive: 'html writes a self-contained interactive file; interactive renders inline in clients supporting MCP UI widgets',
      defaultPalette: ['#4D8CFD', '#FF6B7E', '#F4B83E', '#A6CC74', '#00C19A', '#6859BE'],
    }, null, 2))
  )
}
