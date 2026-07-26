/* Renders every recipe fixture (light + dark) into samples/out/ and builds
 * an index.html contact sheet for visual QA. Also validates that outputs are
 * standalone (no var(), no NaN, no localhost refs).
 *
 * Run: pnpm samples
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

import { recipes } from '../src/recipes/index.js'
import { renderChart } from '../src/render/renderer.js'
import { svgToPng, themeBackground } from '../src/render/rasterize.js'

interface Sample { name: string; input: Record<string, unknown> }

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'samples', 'out')
mkdirSync(outDir, { recursive: true })

const failures: string[] = []
const cards: string[] = []

for (const recipe of recipes) {
  const recipeFile = recipe.name.replace(/^generate_/, '').replace(/_(chart|plot|diagram|map)$/, '')
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const fixtureFile = join(root, 'test', 'fixtures', `${fixtureName(recipeFile)}.ts`)
  if (!existsSync(fixtureFile)) {
    failures.push(`${recipe.name}: no fixture file ${fixtureFile}`)
    continue
  }
  const samples: Sample[] = (await import(fixtureFile)).default

  for (const sample of samples) {
    for (const theme of ['light', 'dark'] as const) {
      const label = `${recipeFile}-${sample.name}-${theme}`
      try {
        const parsed = z.object(recipe.inputShape).parse({ ...sample.input, theme })
        const spec = recipe.toSpec(parsed)
        const result = await renderChart(spec, { idPrefix: 's-' })

        const problems: string[] = []
        if (result.svg.includes('var(')) problems.push('unresolved var()')
        if (result.svg.includes('NaN')) problems.push('NaN in output')
        if (result.svg.includes('localhost')) problems.push('localhost ref')
        if (result.warnings.length) problems.push(`warnings: ${result.warnings.join('; ')}`)
        if (problems.length) failures.push(`${label}: ${problems.join(', ')}`)

        const file = `${label}.svg`
        writeFileSync(join(outDir, file), result.svg)
        cards.push(`<figure class="${theme}"><figcaption>${label}${problems.length ? ` ⚠️ ${problems.join(', ')}` : ''}</figcaption><img src="./${file}" loading="lazy"></figure>`)

        // One rasterized variant per light sample to spot-check PNG output
        if (theme === 'light') {
          const png = await svgToPng(result.svg, { width: result.width, scale: 2, background: themeBackground(theme) })
          writeFileSync(join(outDir, `${label}.png`), png)
          cards.push(`<figure class="${theme}"><figcaption>${label}.png (2x)</figcaption><img src="./${label}.png" loading="lazy"></figure>`)
        }
      } catch (e) {
        failures.push(`${label}: ${(e as Error).message}`)
        cards.push(`<figure class="${theme} error"><figcaption>${label} 💥 ${(e as Error).message}</figcaption></figure>`)
      }
    }
  }
}

writeFileSync(join(outDir, 'index.html'), `<!doctype html>
<html><head><meta charset="utf-8"><title>@unovis/mcp samples</title>
<style>
  body { font-family: Inter, system-ui, sans-serif; margin: 24px; background: #fafbfc; }
  main { display: grid; grid-template-columns: repeat(auto-fill, minmax(560px, 1fr)); gap: 20px; }
  figure { margin: 0; padding: 12px; border-radius: 10px; border: 1px solid #e2e6ea; background: #fff; }
  figure.dark { background: #292b34; border-color: #3a3d47; }
  figure.dark figcaption { color: #aab2c0; }
  figure.error { border-color: #e35a68; }
  figcaption { font-size: 12px; color: #667; margin-bottom: 8px; font-family: ui-monospace, monospace; }
  img { max-width: 100%; height: auto; display: block; }
</style></head>
<body><h1>@unovis/mcp — sample gallery (${cards.length} renders)</h1><main>${cards.join('\n')}</main></body></html>`)

if (failures.length) {
  console.error(`\n✗ ${failures.length} problem(s):`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exitCode = 1
} else {
  console.error('\n✓ all renders passed validation')
}
console.error(`gallery: ${join(outDir, 'index.html')}`)

function fixtureName (recipeFile: string): string {
  return recipeFile.replace(/_/g, '-')
}
