import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(__dirname, '..')
const distRoot = path.join(packageRoot, 'dist')
const srcRoot = path.join(packageRoot, 'src')
const shouldAssert = process.argv.includes('--assert')

const heavyPackages = ['elkjs', 'three', 'leaflet', 'maplibre-gl']

const fixtures = [
  {
    name: 'root-enum',
    code: "import { CurveType } from '@unovis/ts'; console.log(CurveType.MonotoneX)",
  },
  {
    name: 'enums-entrypoint',
    code: "import { CurveType } from '@unovis/ts/enums'; console.log(CurveType.MonotoneX)",
  },
  {
    name: 'granular-curve',
    code: "import { CurveType } from '@unovis/ts/types/curve'; console.log(CurveType.MonotoneX)",
  },
  {
    name: 'line-chart',
    code: "import { Line } from '@unovis/ts'; console.log(Boolean(Line))",
  },
  {
    name: 'graph-control',
    code: "import { Graph } from '@unovis/ts'; console.log(Boolean(Graph))",
  },
]

function normalizeId (id) {
  return id.replace(/\\/g, '/')
}

function parseExportTargets (source) {
  return source
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('export') && line.includes(' from '))
    .map((line) => {
      const quote = line.includes("'") ? "'" : '"'
      const start = line.indexOf(quote)
      const end = line.lastIndexOf(quote)
      return start >= 0 && end > start ? line.slice(start + 1, end) : null
    })
    .filter(Boolean)
}

function detectHeavyPackages (moduleIds) {
  const heavy = new Set()
  for (const id of moduleIds) {
    for (const pkg of heavyPackages) {
      if (
        id.includes(`/node_modules/${pkg}/`) ||
        id.includes(`/node_modules/.pnpm/${pkg}@`) ||
        id.includes(`/node_modules/.pnpm/${pkg}_`)
      ) {
        heavy.add(pkg)
      }
    }
  }
  return [...heavy].sort()
}

function makeLocalResolverPlugin () {
  return {
    name: 'resolve-unovis-local-dist',
    resolveId (source) {
      if (source === '@unovis/ts') return path.join(distRoot, 'index.js')
      if (!source.startsWith('@unovis/ts/')) return null

      const subPath = source.slice('@unovis/ts/'.length)
      if (subPath.startsWith('dist/')) return path.join(distRoot, subPath.slice('dist/'.length))
      if (subPath.endsWith('.js')) return path.join(distRoot, subPath)
      return path.join(distRoot, `${subPath}.js`)
    },
  }
}

function makeCapturePlugin (collectedModules) {
  return {
    name: 'capture-module-graph',
    moduleParsed (info) {
      if (!info?.id) return
      collectedModules.add(normalizeId(info.id))
    },
  }
}

async function runFixture (fixture) {
  const tmpRoot = await mkdtemp(path.join(os.tmpdir(), 'unovis-vite-graph-'))
  const entryFile = path.join(tmpRoot, `${fixture.name}.ts`)
  const modules = new Set()

  try {
    await writeFile(entryFile, fixture.code, 'utf8')

    await build({
      configFile: false,
      logLevel: 'silent',
      root: tmpRoot,
      plugins: [
        makeLocalResolverPlugin(),
        makeCapturePlugin(modules),
      ],
      build: {
        write: false,
        minify: false,
        sourcemap: false,
        target: 'esnext',
        rollupOptions: {
          input: entryFile,
        },
      },
    })
  } finally {
    await rm(tmpRoot, { recursive: true, force: true })
  }

  const moduleIds = [...modules]
  const nodeModuleIds = moduleIds.filter(id => id.includes('/node_modules/'))
  const heavyDeps = detectHeavyPackages(moduleIds)

  return {
    fixture: fixture.name,
    modulesTransformed: moduleIds.length,
    nodeModulesTransformed: nodeModuleIds.length,
    heavyDeps,
  }
}

function printRows (rows) {
  const columns = [
    ['fixture', 'fixture'],
    ['modules', 'modulesTransformed'],
    ['node_modules', 'nodeModulesTransformed'],
    ['heavy deps', 'heavyDeps'],
  ]

  const printable = rows.map(row => ({
    ...row,
    heavyDeps: row.heavyDeps.length ? row.heavyDeps.join(', ') : '-',
  }))

  const widths = columns.map(([title, key]) => {
    const contentWidth = Math.max(...printable.map(row => String(row[key]).length))
    return Math.max(title.length, contentWidth)
  })

  const line = columns
    .map(([title], i) => title.padEnd(widths[i], ' '))
    .join(' | ')
  const divider = widths.map(w => '-'.repeat(w)).join('-|-')

  console.log(line)
  console.log(divider)

  for (const row of printable) {
    console.log(columns.map(([, key], i) => String(row[key]).padEnd(widths[i], ' ')).join(' | '))
  }
}

function evaluateAssertions (rows) {
  const byName = new Map(rows.map(r => [r.fixture, r]))
  const root = byName.get('root-enum')
  const enums = byName.get('enums-entrypoint')
  const granular = byName.get('granular-curve')
  const failures = []

  const factor = (a, b) => {
    if (!a || !b) return 0
    if (!b.nodeModulesTransformed) return Number.POSITIVE_INFINITY
    return a.nodeModulesTransformed / b.nodeModulesTransformed
  }

  const enumsFactor = factor(root, enums)
  const granularFactor = factor(root, granular)

  if (!(enumsFactor >= 10 || granularFactor >= 10)) {
    failures.push(`expected >=10x node_modules reduction (root vs enums/granular), got enums=${enumsFactor.toFixed(2)}x granular=${granularFactor.toFixed(2)}x`)
  }

  if (enums?.heavyDeps.length) {
    failures.push(`expected no heavy deps for enums-entrypoint, found: ${enums.heavyDeps.join(', ')}`)
  }

  if (granular?.heavyDeps.length) {
    failures.push(`expected no heavy deps for granular-curve, found: ${granular.heavyDeps.join(', ')}`)
  }

  return { failures, enumsFactor, granularFactor }
}

async function main () {
  const required = [path.join(distRoot, 'index.js'), path.join(distRoot, 'enums.js')]
  const missing = required.filter(file => !existsSync(file))
  if (missing.length) {
    const relMissing = missing.map(file => path.relative(packageRoot, file))
    throw new Error(`Missing build artifacts: ${relMissing.join(', ')}. Run \"pnpm --filter @unovis/ts forcebuild\" first.`)
  }

  const [indexSource, typesSource] = await Promise.all([
    readFile(path.join(srcRoot, 'index.ts'), 'utf8'),
    readFile(path.join(srcRoot, 'types.ts'), 'utf8'),
  ])

  const indexTargets = parseExportTargets(indexSource)
  const typeTargets = parseExportTargets(typesSource)

  console.log('Vite module-graph analysis for @unovis/ts')
  console.log('')
  console.log(`src/index.ts re-export targets: ${indexTargets.length}`)
  console.log(indexTargets.map(t => `  - ${t}`).join('\n'))
  console.log('')
  console.log(`src/types.ts re-export targets: ${typeTargets.length}`)
  console.log(typeTargets.map(t => `  - ${t}`).join('\n'))
  console.log('')

  const rows = []
  for (const fixture of fixtures) {
    rows.push(await runFixture(fixture))
  }

  printRows(rows)
  console.log('')

  const { failures, enumsFactor, granularFactor } = evaluateAssertions(rows)
  const enumsFactorLabel = Number.isFinite(enumsFactor) ? `${enumsFactor.toFixed(2)}x` : 'infinite'
  const granularFactorLabel = Number.isFinite(granularFactor) ? `${granularFactor.toFixed(2)}x` : 'infinite'
  console.log(`root-enum -> enums-entrypoint reduction: ${enumsFactorLabel}`)
  console.log(`root-enum -> granular-curve reduction: ${granularFactorLabel}`)

  if (shouldAssert) {
    if (failures.length) {
      console.log('')
      console.log('assertion failures:')
      for (const failure of failures) console.log(`  - ${failure}`)
      process.exitCode = 1
      return
    }
    console.log('')
    console.log('assertions passed')
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
