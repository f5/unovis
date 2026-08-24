/* Generates docs/mcp/ from packages/mcp/docs.
 *
 * The MCP package's docs ship inside its npm tarball, so they are the single
 * source of truth; this script adapts them for Docusaurus (frontmatter, sidebar
 * order, index naming) instead of keeping a second copy by hand.
 *
 * Run: pnpm sync:mcp-docs (chained from the website's start and build scripts)
 * Check for drift in CI with: pnpm sync:mcp-docs && git diff --exit-code docs/mcp
 */
import { mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const websiteRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(websiteRoot, '..', 'mcp', 'docs')
const target = join(websiteRoot, 'docs', 'mcp')

/** Sidebar order and the one-line descriptions Docusaurus shows in listings */
const PAGES = [
  ['README.md', 'index.md', 'Generate Unovis charts from an MCP server'],
  ['getting-started.md', 'getting-started.md', 'Install the server and connect it to your client'],
  ['tools.md', 'tools.md', 'Every chart tool and its options'],
  ['output-types.md', 'output-types.md', 'SVG, PNG, interactive HTML, chart spec or framework code'],
  ['chart-spec.md', 'chart-spec.md', 'The JSON format behind every generated chart'],
  ['programmatic.md', 'programmatic.md', 'Render charts from your own code, scripts or CI'],
  ['interactive.md', 'interactive.md', 'Live charts, the browser widget and iframe embedding'],
  ['webview.md', 'webview.md', 'Embedding charts in React Native and other native WebViews'],
  ['architecture.md', 'architecture.md', 'How Unovis renders headlessly in Node'],
  ['troubleshooting.md', 'troubleshooting.md', 'Fonts, blank charts, timeouts and known limits'],
]

const BANNER = '<!-- Generated from packages/mcp/docs — edit there, then run `pnpm sync:mcp-docs`. -->'

/** Docusaurus resolves relative .md links, so only the renamed index moves */
const rewriteLinks = (markdown) => markdown
  .replace(/\]\(\.\/README\.md/g, '](./index.md')

/* Docusaurus takes the page title from the first node when it's a heading, so
 * the banner has to go after it — above it, every page is titled by filename. */
const addBanner = (markdown) => {
  const heading = markdown.match(/^#\s.*$/m)
  if (!heading) throw new Error('expected a level-1 heading to title the page')
  const end = heading.index + heading[0].length
  return `${markdown.slice(0, end)}\n\n${BANNER}${markdown.slice(end)}`
}

rmSync(target, { recursive: true, force: true })
mkdirSync(target, { recursive: true })

const known = new Set(PAGES.map(([from]) => from))
const missing = readdirSync(source).filter(file => file.endsWith('.md') && !known.has(file))
if (missing.length) {
  console.error(`✗ packages/mcp/docs has pages this script doesn't know about: ${missing.join(', ')}`)
  console.error('  Add them to PAGES in scripts/sync-mcp-docs.mjs so they get a sidebar position.')
  process.exit(1)
}

PAGES.forEach(([from, to, description], index) => {
  const markdown = readFileSync(join(source, from), 'utf8')
  const frontmatter = [
    '---',
    // CommonMark, not MDX: these pages are full of JSON snippets and `{}` would
    // otherwise be parsed as JSX expressions
    'mdx:',
    '  format: md',
    `description: ${description}`,
    `sidebar_position: ${index + 1}`,
    ...(to === 'index.md' ? ['sidebar_label: Overview', 'slug: /mcp'] : []),
    '---',
    '',
  ].join('\n')
  writeFileSync(join(target, to), frontmatter + addBanner(rewriteLinks(markdown)))
})

console.error(`✓ wrote ${PAGES.length} pages to docs/mcp`)
