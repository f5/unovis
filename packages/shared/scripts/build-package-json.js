import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'

const dist = resolve('dist')
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const files = new Set(readdirSync(dist, { recursive: true, withFileTypes: true })
  .filter(entry => entry.isFile())
  .map(entry => `./${relative(dist, join(entry.parentPath, entry.name)).replaceAll(sep, '/')}`)
  .sort())

const entries = {}
for (const file of files) {
  const stem = file.replace(/(?:\.d\.ts|\.js)$/, '')
  if (stem === file || entries[stem]) continue
  const types = `${stem}.d.ts`
  const runtime = `${stem}.js`
  entries[stem] = {
    ...(files.has(types) && { types }),
    ...(files.has(runtime) && { default: runtime }),
  }
}

// Match file-before-directory resolution when both forms exist.
for (const [stem, target] of Object.entries(entries)) {
  if (stem.endsWith('/index')) entries[stem.slice(0, -'/index'.length)] ??= target
}

delete pkg.typesVersions
pkg.exports = { ...entries, './*': './*' }
writeFileSync(join(dist, 'package.json'), JSON.stringify(pkg, null, 2))
