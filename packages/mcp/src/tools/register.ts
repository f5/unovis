/** Bind chart recipes to MCP tools. */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute } from 'node:path'

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

import { recipes } from '../recipes/index.js'
import type { AnyRecipe } from '../recipes/index.js'
import { renderChart, ChartInputError } from '../render/renderer.js'

export interface ToolFilterOptions {
  /** Tool names to hide (env DISABLED_TOOLS / --disable-tools) */
  disabledTools?: string[];
  /** When set, only these tools are exposed (--tools) */
  enabledTools?: string[];
}

const textResult = (text: string, isError = false): CallToolResult =>
  ({ content: [{ type: 'text', text }], ...(isError ? { isError: true } : {}) })

async function runRecipe (recipe: AnyRecipe, input: Record<string, unknown>): Promise<CallToolResult> {
  try {
    const spec = recipe.toSpec(input)

    if (input.outputType === 'config') {
      return textResult(JSON.stringify(spec, null, 2))
    }

    const result = await renderChart(spec)
    const warningsNote = result.warnings.length ? `\n<!-- warnings: ${result.warnings.join('; ')} -->` : ''

    const outputPath = input.outputPath as string | undefined
    if (outputPath) {
      if (!isAbsolute(outputPath) || !outputPath.endsWith('.svg')) {
        return textResult(`outputPath must be an absolute path ending in .svg, got: ${outputPath}`, true)
      }
      mkdirSync(dirname(outputPath), { recursive: true })
      writeFileSync(outputPath, `<?xml version="1.0" encoding="UTF-8"?>\n${result.svg}`)
      return textResult(`Chart saved to ${outputPath} (${result.width}×${result.height})${warningsNote}`)
    }

    return textResult(result.svg + warningsNote)
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
      outputTypes: ['svg', 'config'],
      defaultPalette: ['#4D8CFD', '#FF6B7E', '#F4B83E', '#A6CC74', '#00C19A', '#6859BE'],
    }, null, 2))
  )
}
