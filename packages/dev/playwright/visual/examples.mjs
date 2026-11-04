/** Lists every dev example the way `src/examples/index.ts` registers them at runtime, from the
 * sources: the category is the title-cased second folder, the title the module's `title` export
 * (or `<Category> Data Transitions` for the `transitionComponent` modules). The root page renders
 * no links to crawl, so this is the only way to enumerate the routes without running the app. */
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const examplesDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../src/examples')

/** Mirrors `src/utils/text.ts` (importing the .ts source makes Node warn about the package's module type) */
const kebabToTitleCase = (s) => s.replace(/(^|-)([a-z])/g, (_, a, b) => `${a.replace('-', ' ')}${b.toUpperCase()}`)

/**
 * @typedef {object} Example
 * @property {string} section
 * @property {string} category
 * @property {string} title
 * @property {string} file  Path of the index.tsx relative to src/examples
 * @property {string} route Encoded `/examples/<category>/<title>` path
 * @property {string} slug  File-system-safe unique id (used as the image name)
 */

function * walk (dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield * walk(path)
    else if (entry.name === 'index.tsx') yield path
  }
}

const toSlug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** @returns {Example[]} sorted by section, category and title */
export function listExamples () {
  const examples = []
  for (const path of walk(examplesDir)) {
    const file = relative(examplesDir, path).split(sep).join('/')
    const [section, categoryDir] = file.split('/')
    if (!categoryDir || categoryDir === 'index.tsx') continue
    const category = kebabToTitleCase(categoryDir)
    const source = readFileSync(path, 'utf8')
    let title
    if (/^export const transitionComponent\b/m.test(source)) {
      title = `${category} Data Transitions`
    } else {
      title = source.match(/^export const title = (['"`])(.*?)\1/m)?.[2]
      if (!title) throw new Error(`${file}: no \`export const title\` found`)
    }
    examples.push({
      section,
      category,
      title,
      file,
      route: `/examples/${encodeURIComponent(category)}/${encodeURIComponent(title)}`,
      slug: `${toSlug(category)}--${toSlug(title)}`,
    })
  }

  examples.sort((a, b) => a.section.localeCompare(b.section) || a.category.localeCompare(b.category) || a.title.localeCompare(b.title))
  const slugs = new Set()
  for (const example of examples) {
    if (slugs.has(example.slug)) throw new Error(`Duplicate example slug ${example.slug} (${example.file})`)
    slugs.add(example.slug)
  }
  return examples
}
