/** Documentation guards.
 *
 * Docs rot silently, so the two things that can be checked mechanically are:
 * every page referenced from the index exists, and the generated tools
 * reference still matches the tools the server exposes.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { recipes } from '../src/recipes/index.js'

const docsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs')
const read = (name: string): string => readFileSync(join(docsDir, name), 'utf8')

describe('documentation', () => {
  it('has every page linked from the index', () => {
    const index = read('README.md')
    const links = [...index.matchAll(/\]\(\.\/([\w-]+\.md)(#[\w-]+)?\)/g)].map(m => m[1])
    expect(links.length).toBeGreaterThan(5)
    for (const link of new Set(links)) {
      expect(existsSync(join(docsDir, link)), `docs/${link} is linked from the index`).toBe(true)
    }
  })

  it('resolves cross-page links', () => {
    const pages = ['README.md', 'getting-started.md', 'output-types.md', 'chart-spec.md',
      'programmatic.md', 'interactive.md', 'architecture.md', 'troubleshooting.md', 'tools.md']
    for (const page of pages) {
      const content = read(page)
      for (const [, target] of content.matchAll(/\]\(\.\/([\w-]+\.md)(?:#[\w-]+)?\)/g)) {
        expect(existsSync(join(docsDir, target)), `${page} links to docs/${target}`).toBe(true)
      }
    }
  })

  it('documents every tool the server exposes', () => {
    const tools = read('tools.md')
    for (const recipe of recipes) {
      expect(tools, `${recipe.name} is documented — run \`pnpm docs:tools\``).toContain(`### \`${recipe.name}\``)
    }
    expect(tools).toContain('## `get_unovis_info`')
  })

  it('documents every option of every tool', () => {
    const tools = read('tools.md')
    // Options shared by all tools are documented once, in output-types.md
    const shared = new Set(['width', 'height', 'theme', 'title', 'colors', 'outputType', 'outputPath', 'scale', 'framework'])
    for (const recipe of recipes) {
      for (const option of Object.keys(recipe.inputShape)) {
        if (shared.has(option)) continue
        expect(tools, `${recipe.name}.${option} — run \`pnpm docs:tools\``).toContain(`\`${option}\``)
      }
    }
    const outputs = read('output-types.md')
    for (const option of shared) expect(outputs, `shared option ${option}`).toContain(`\`${option}\``)
  })

  it('lists every output type and framework', () => {
    const outputs = read('output-types.md')
    for (const type of ['svg', 'png', 'html', 'interactive', 'config', 'code']) {
      expect(outputs).toContain(`\`${type}\``)
    }
    for (const framework of ['ts', 'react', 'svelte', 'vue', 'angular', 'solid']) {
      expect(outputs).toContain(framework)
    }
  })
})
