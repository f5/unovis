/** Bind chart recipes to MCP tools. */
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, isAbsolute, join, resolve, sep } from 'node:path'

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

import { svgToPng, themeBackground } from '@unovis/ssr'
import { recipes } from '../recipes/index.js'
import type { AnyRecipe } from '../recipes/index.js'
import { renderChart, resolveMapMarkers, ChartInputError } from '../render/renderer.js'
import { buildChartDocument } from '../html/document.js'
import { generateCode, formatGeneratedFiles } from '../codegen/index.js'
import type { Framework } from '../codegen/index.js'
import type { ChartSpec } from '../render/spec.js'

export interface ToolFilterOptions {
  /** Tool names to hide (env DISABLED_TOOLS / --disable-tools) */
  disabledTools?: string[];
  /** When set, only these tools are exposed (--tools) */
  enabledTools?: string[];
  /** Where `outputPath` may write. `undefined` = anywhere (a local stdio
   * server acts with its user's own authority); a directory = only inside
   * it; `false` = file writes disabled. The HTTP transport defaults to
   * `false` — an unauthenticated network endpoint must not double as a
   * remote file-write primitive. */
  writeDir?: string | false;
}

/** MCP Apps resource the interactive output binds to (registered in server.ts) */
export const WIDGET_URI = 'ui://unovis/chart'

/** MCP Apps extension (SEP-1865, io.modelcontextprotocol/ui) wire constants.
 * Pinned by tests; keep in sync with the extension spec rather than importing
 * @modelcontextprotocol/ext-apps, whose react peer deps we don't need. */
export const APPS_MIME_TYPE = 'text/html;profile=mcp-app'
export const APPS_EXTENSION_ID = 'io.modelcontextprotocol/ui'

const textResult = (text: string, isError = false): CallToolResult =>
  ({ content: [{ type: 'text', text }], ...(isError ? { isError: true } : {}) })

/** Map data lives behind a `{ $unovisMap }` marker that only the Node renderer
 * resolves — the browser widget has no map bundles, so bake it into the spec */
async function specForBrowser (spec: ChartSpec): Promise<ChartSpec> {
  return { ...spec, components: await resolveMapMarkers(spec.components) }
}

const chartSummary = (spec: ChartSpec): string =>
  `${spec.title ?? spec.components.map(c => c.type).join(' + ')} (${spec.width}×${spec.height}, ${spec.theme} theme)`

/** Enforce the write policy on a requested outputPath. Returns an error
 * message, or undefined when the write is allowed. */
export function refuseWrite (outputPath: string, writeDir: ToolFilterOptions['writeDir']): string | undefined {
  if (writeDir === undefined) return undefined
  if (writeDir === false) {
    return 'outputPath is disabled on this server — request inline output, or start the server with --allow-write-dir <dir>'
  }
  const dir = resolve(writeDir)
  const target = resolve(outputPath)
  if (target !== dir && !target.startsWith(dir + sep)) {
    return `outputPath must be inside ${dir} on this server, got: ${outputPath}`
  }
  return undefined
}

/** In an MCP Apps host, every declared tool call renders the widget iframe —
 * so every result must carry the spec, or the frame sits empty next to the
 * answer. Gated on the client capability to keep non-Apps responses lean
 * (the spec embeds the full dataset). */
async function appsResult (result: CallToolResult, spec: ChartSpec, appsHost: boolean): Promise<CallToolResult> {
  if (!appsHost) return result
  return {
    ...result,
    structuredContent: { spec: (await specForBrowser(spec)) as unknown as Record<string, unknown> },
  }
}

async function runRecipe (recipe: AnyRecipe, input: Record<string, unknown>, writeDir?: ToolFilterOptions['writeDir'], appsHost = false): Promise<CallToolResult> {
  try {
    const spec = recipe.toSpec(input)

    if (input.outputType === 'config') {
      return appsResult(textResult(JSON.stringify(spec, null, 2)), spec, appsHost)
    }

    // Code: emit source for the chosen wrapper. Uses the unresolved spec so
    // map data stays an import rather than an inlined payload.
    if (input.outputType === 'code') {
      const files = generateCode(spec, (input.framework as Framework | undefined) ?? 'ts')
      return appsResult(textResult(formatGeneratedFiles(files)), spec, appsHost)
    }

    // Interactive: hand the spec to a UI-capable client, which renders it with
    // the widget resource. Static content stays in the transcript as a summary.
    if (input.outputType === 'interactive') {
      const browserSpec = await specForBrowser(spec)
      return {
        content: [{ type: 'text', text: `Interactive chart: ${chartSummary(spec)}` }],
        structuredContent: { spec: browserSpec as unknown as Record<string, unknown> },
        // Result-level template link kept for pre-MCP-Apps hosts; official
        // hosts key off the tool-level _meta.ui declaration instead
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
    if (outputPath) {
      const refused = refuseWrite(outputPath, writeDir)
      if (refused) return textResult(refused, true)
    }

    // Self-contained interactive document. Always written to disk: the inlined
    // widget bundle is far too large to put in a tool result.
    if (isHtml) {
      // html output IS a file — with writes disabled there is nothing to return
      if (writeDir === false) {
        return textResult('outputType "html" writes a file, which is disabled on this server — use "svg", "png" or "interactive", or start the server with --allow-write-dir <dir>', true)
      }
      const html = buildChartDocument(await specForBrowser(spec))
      const fallbackDir = typeof writeDir === 'string' ? resolve(writeDir) : tmpdir()
      const target = outputPath ?? join(mkdtempSync(join(fallbackDir, 'unovis-chart-')), 'chart.html')
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, html)
      return appsResult(textResult(`Interactive chart saved to ${target} — open it in a browser for tooltips, ` +
        `crosshair and hover highlighting. ${chartSummary(spec)}`), spec, appsHost)
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
        return appsResult(textResult(`Chart saved to ${outputPath} (${result.width}×${result.height} at ${input.scale ?? 2}x)${warningsNote}`), spec, appsHost)
      }
      return appsResult({
        content: [
          { type: 'image', data: png.toString('base64'), mimeType: 'image/png' },
          ...(warningsNote ? [{ type: 'text' as const, text: warningsNote.trim() }] : []),
        ],
      }, spec, appsHost)
    }

    if (outputPath) {
      mkdirSync(dirname(outputPath), { recursive: true })
      writeFileSync(outputPath, `<?xml version="1.0" encoding="UTF-8"?>\n${result.svg}`)
      return appsResult(textResult(`Chart saved to ${outputPath} (${result.width}×${result.height})${warningsNote}`), spec, appsHost)
    }

    return appsResult(textResult(result.svg + (result.warnings.length ? `\n<!-- warnings: ${result.warnings.join('; ')} -->` : '')), spec, appsHost)
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

/** Connections whose client advertised the MCP Apps extension.
 *
 * The SDK's ClientCapabilities schema predates SEP-1724, so it strips the
 * `extensions` key during initialize — getClientCapabilities() can never see
 * it (verified end-to-end). Until the SDK learns the field, the raw
 * initialize message is sniffed at the transport seam; the schema path below
 * takes over automatically once it stops returning undefined. */
const appsClients = new WeakSet<McpServer>()

/** Intercept a transport's onmessage assignment to sniff
 * `capabilities.extensions` from the raw initialize request. Must run BEFORE
 * connect — with an in-memory transport the initialize can arrive in the same
 * microtask the connection is established in. */
export function sniffAppsCapability (server: McpServer, transport: object): void {
  type Handler = (...args: never[]) => void
  let assigned: Handler | undefined
  Object.defineProperty(transport, 'onmessage', {
    configurable: true,
    enumerable: true,
    get: () => assigned,
    set: (handler: Handler | undefined) => {
      assigned = handler && ((...args: never[]) => {
        const message = args[0] as { method?: string; params?: { capabilities?: { extensions?: Record<string, unknown> } } }
        if (message?.method === 'initialize' && message.params?.capabilities?.extensions?.[APPS_EXTENSION_ID]) {
          appsClients.add(server)
        }
        handler.apply(transport, args)
      })
    },
  })
}

/** Did the connected client advertise the MCP Apps extension capability? */
function appsCapableClient (server: McpServer): boolean {
  if (appsClients.has(server)) return true
  const capabilities = server.server.getClientCapabilities() as { extensions?: Record<string, unknown> } | undefined
  return Boolean(capabilities?.extensions?.[APPS_EXTENSION_ID])
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
        // MCP Apps: the template is declared on the tool, ahead of time, so
        // hosts can prefetch, cache and security-review it before any call
        _meta: { ui: { resourceUri: WIDGET_URI } },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (args: any) => runRecipe(recipe, args, filter.writeDir, appsCapableClient(server))
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
