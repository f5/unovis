import { mountReact } from './mounts/react'
import { mountVue } from './mounts/vue'
import { mountSolid } from './mounts/solid'
import { mountSvelte } from './mounts/svelte'
import { mountTs } from './mounts/ts'
import { renderSidebar, getActiveSlug } from './sidebar'

type Loader = () => Promise<{ default: unknown }>

// Glob the example files. Vite returns { path: () => Promise<module> } maps.
// We explicitly exclude:
//   - index.tsx (uses webpack `require()` in the existing registry — Vite can't run it)
//   - *-solid.tsx (claimed by the Solid glob below)
//   - *.component.ts / *.module.ts (Angular triple, requires `@unovis/angular` + AnalogJS)
//   - data.ts / types.ts (shared module imports, not entry points)
const reactFiles = import.meta.glob([
  '../../examples/*/*.tsx',
  '!../../examples/*/index.tsx',
  '!../../examples/*/*-solid.tsx',
])
const solidFiles = import.meta.glob('../../examples/*/*-solid.tsx')
const vueFiles = import.meta.glob('../../examples/*/*.vue')
const svelteFiles = import.meta.glob('../../examples/*/*.svelte')
const tsFiles = import.meta.glob([
  '../../examples/*/*.ts',
  '!../../examples/*/*.component.ts',
  '!../../examples/*/*.module.ts',
  '!../../examples/*/data.ts',
  '!../../examples/*/types.ts',
])

const slugFromPath = (p: string): string => {
  // ../../examples/<slug>/<file>
  const m = p.match(/examples\/([^/]+)\//)
  return m ? m[1] : ''
}

// Discover all example slugs from the union of globs.
const allSlugs = new Set<string>()
for (const map of [reactFiles, vueFiles, solidFiles, svelteFiles, tsFiles]) {
  for (const p of Object.keys(map)) {
    const slug = slugFromPath(p)
    if (slug) allSlugs.add(slug)
  }
}

const activeSlug = getActiveSlug([...allSlugs])
renderSidebar([...allSlugs].sort(), activeSlug)

// Picks the React (non-Solid) tsx for the current slug.
const pickReact = (slug: string): Loader | undefined => {
  for (const [path, loader] of Object.entries(reactFiles)) {
    if (slugFromPath(path) !== slug) continue
    if (path.endsWith('-solid.tsx')) continue
    if (path.endsWith('/index.tsx')) continue
    return loader as Loader
  }
  return undefined
}

const pickSolid = (slug: string): Loader | undefined => {
  for (const [path, loader] of Object.entries(solidFiles)) {
    if (slugFromPath(path) === slug) return loader as Loader
  }
  return undefined
}

const pickVue = (slug: string): Loader | undefined => {
  for (const [path, loader] of Object.entries(vueFiles)) {
    if (slugFromPath(path) === slug) return loader as Loader
  }
  return undefined
}

const pickSvelte = (slug: string): Loader | undefined => {
  for (const [path, loader] of Object.entries(svelteFiles)) {
    if (slugFromPath(path) === slug) return loader as Loader
  }
  return undefined
}

// Vanilla TS: pick the entry file named exactly `<slug>.ts`. Anything else
// in the directory (`constants.ts`, `data.ts`, `types.ts`, the Angular triple)
// is a helper, not a self-mounting example.
const pickTs = (slug: string): Loader | undefined => {
  const entry = `${slug}.ts`
  for (const [path, loader] of Object.entries(tsFiles)) {
    if (slugFromPath(path) !== slug) continue
    if (!path.endsWith(`/${entry}`)) continue
    return loader as Loader
  }
  return undefined
}

const showError = (target: HTMLElement, label: string, err: unknown): void => {
  const message = err instanceof Error ? `${err.message}\n${err.stack ?? ''}` : String(err)
  target.innerHTML = `<div class="panel-error">${label}: ${message.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] ?? c))}</div>`
  // eslint-disable-next-line no-console
  console.error(`[${label}]`, err)
}

const byId = (id: string): HTMLElement => {
  const el = document.getElementById(id)
  if (!el) throw new Error(`#${id} not in DOM`)
  return el
}

async function mountAll (slug: string): Promise<void> {
  const reactLoader = pickReact(slug)
  const solidLoader = pickSolid(slug)
  const vueLoader = pickVue(slug)
  const svelteLoader = pickSvelte(slug)
  const tsLoader = pickTs(slug)

  if (reactLoader) {
    try { mountReact(byId('root-react'), (await reactLoader()).default as React.ComponentType) } catch (e) { showError(byId('root-react'), 'react', e) }
  } else byId('root-react').innerHTML = '<div class="panel-error">no react variant</div>'

  if (vueLoader) {
    try { mountVue(byId('root-vue'), (await vueLoader()).default as Parameters<typeof mountVue>[1]) } catch (e) { showError(byId('root-vue'), 'vue', e) }
  } else byId('root-vue').innerHTML = '<div class="panel-error">no vue variant</div>'

  if (solidLoader) {
    try { mountSolid(byId('root-solid'), (await solidLoader()).default as Parameters<typeof mountSolid>[1]) } catch (e) { showError(byId('root-solid'), 'solid', e) }
  } else byId('root-solid').innerHTML = '<div class="panel-error">no solid variant</div>'

  if (svelteLoader) {
    try { await mountSvelte(byId('root-svelte'), (await svelteLoader()).default as Parameters<typeof mountSvelte>[1]) } catch (e) { showError(byId('root-svelte'), 'svelte', e) }
  } else byId('root-svelte').innerHTML = '<div class="panel-error">no svelte variant</div>'

  if (tsLoader) {
    try { await mountTs(tsLoader as () => Promise<unknown>) } catch (e) { showError(byId('root-ts'), 'ts', e) }
  } else byId('root-ts').innerHTML = '<div class="panel-error">no ts variant</div>'
}

mountAll(activeSlug)
