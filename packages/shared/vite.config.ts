import { defineConfig, transformWithEsbuild } from 'vite'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import solid from 'vite-plugin-solid'
import { svelte } from '@sveltejs/vite-plugin-svelte'

const here = fileURLToPath(new URL('.', import.meta.url))
const pkgSrc = (name: string): string => resolve(here, '..', name, 'src')
const pkgDist = (name: string): string => resolve(here, '..', name, 'dist')

const angularFilePatterns = [
  /\.(component|module|directive)\.ts$/,
  /[/\\]packages[/\\]angular[/\\]src[/\\].+\.ts$/,
  /[/\\]gallery-dev-server[/\\]src[/\\]mounts[/\\]angular\.ts$/,
]
const isAngularFile = (id: string): boolean => {
  const file = id.split('?')[0]
  return angularFilePatterns.some(re => re.test(file))
}

export default defineConfig({
  root: 'gallery-dev-server',
  plugins: [
    // @unovis/ts has ONE `import leafletCSS from './leaflet.css'` (in
    // packages/ts/src/components/leaflet-map/style.ts) that expects the CSS as
    // a string default export — webpack provides this via css-loader; Vite no
    // longer supports default-import of plain CSS. Rewrite that one import to
    // `?inline`. (A broader rewrite breaks side-effect imports like the TS
    // dual-axis-chart's `import './styles.css'`.)
    {
      name: 'unovis-leaflet-css-as-inline',
      enforce: 'pre',
      async resolveId (source, importer) {
        if (!importer) return null
        if (source !== './leaflet.css') return null
        if (!importer.includes('/leaflet-map/style.')) return null
        const resolved = await this.resolve(source, importer, { skipSelf: true })
        if (!resolved) return null
        return { ...resolved, id: `${resolved.id}?inline` }
      },
    },
    // Angular (JIT): inline external templates and transpile the decorator
    // sources with the legacy class-field semantics Angular needs. Runs `pre`
    // so it claims these files before the React/Babel plugin (whose `.tsx?`
    // include would otherwise grab the `.ts` files and break the decorators).
    {
      name: 'unovis-angular-jit',
      enforce: 'pre',
      async transform (code, id) {
        if (!isAngularFile(id)) return null
        const file = id.split('?')[0]
        let src = code

        const tpl = src.match(/templateUrl:\s*['"](.+?)['"]/)

        if (tpl) {
          const htmlPath = resolve(dirname(file), tpl[1])
          let html = await readFile(htmlPath, 'utf8')

          html = html.replace(
            /<([a-z][\w-]*-[\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)\s*\/>/g,
            '<$1$2></$1>'
          )

          src = src.replace(tpl[0], () => `template: ${JSON.stringify(html)}`)
          this.addWatchFile(htmlPath)
        }

        const styleUrls = src.match(/styleUrls:\s*\[([^\]]*)\]/)
        if (styleUrls) {
          const paths = [...styleUrls[1].matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1])
          const cssList = await Promise.all(paths.map(async p => {
            const cssPath = resolve(dirname(file), p)
            this.addWatchFile(cssPath)
            return readFile(cssPath, 'utf8')
          }))
          const styles = `styles: [${cssList.map(css => JSON.stringify(css)).join(', ')}]`
          src = src.replace(styleUrls[0], () => styles)
        }

        const base = {
          experimentalDecorators: true,
          useDefineForClassFields: false,
          target: ts.ScriptTarget.ES2020,
          module: ts.ModuleKind.ESNext,
          sourceMap: true,
          importHelpers: false,
        }
        const wantsMetadata = /[/\\]examples[/\\][^/\\]+[/\\][^/\\]+\.component\.ts$/.test(file)
        const compile = (emitDecoratorMetadata: boolean): ts.TranspileOutput =>
          ts.transpileModule(src, { fileName: file, compilerOptions: { ...base, emitDecoratorMetadata } })
        let out: ts.TranspileOutput
        try {
          out = compile(wantsMetadata)
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          if (!(wantsMetadata && /Debug Failure/.test(msg))) throw err
          // eslint-disable-next-line no-console
          console.warn(`[unovis-angular-jit] ${file}: dropped decorator metadata (${msg.split('\n')[0]}); constructor DI here may not resolve`)
          out = compile(false)
        }
        return { code: out.outputText, map: out.sourceMapText ? JSON.parse(out.sourceMapText) : null }
      },
    },
    // Solid plugin owns: example *-solid.tsx + every .tsx under @unovis/solid/src
    solid({ include: [/-solid\.tsx$/, /\/packages\/solid\/src\/.+\.tsx$/] }),
    // React plugin owns everything else .tsx (example React variants + @unovis/react/src)
    react({
      include: /\.tsx?$/,
      exclude: [/-solid\.tsx$/, /\/packages\/solid\/src\//, /\/packages\/vue\/src\//, /\/packages\/svelte\/src\//,
        ...angularFilePatterns],
    }),
    vue(),
    // The @unovis/svelte source uses TS syntax in <script> blocks WITHOUT
    // declaring `lang="ts"`. We use a lightweight custom preprocessor that
    // strips types via `transformWithEsbuild` — the old `svelte-preprocess@4`
    // hardcodes the removed `importsNotUsedAsValues` compiler option which
    // errors on TypeScript 5.5+.
    // `hot: false` disables svelte-hmr's proxy wrapping. The proxy breaks
    // Svelte's lifecycle when we mount via `new Component({target})` outside a
    // tracked container — onMount callbacks never fire under the proxy here.
    svelte({
      preprocess: {
        async script ({ content, attributes, filename }) {
          // Treat all <script> blocks as TS (the @unovis/svelte source omits lang="ts" on some files)
          if (attributes.lang && attributes.lang !== 'ts' && attributes.lang !== 'typescript') return

          // Example files live in packages/shared/examples/ — their imports are
          // only referenced in the Svelte template. Internal @unovis/svelte
          // components reference their imports in the script body, so esbuild
          // can safely tree-shake unused (type-only) imports for those.
          const isExample = !!filename && /[/\\]examples[/\\]/.test(filename)

          if (!isExample) {
            // Internal components: just strip types, let esbuild elide type imports
            const result = await transformWithEsbuild(content, filename ?? 'script.ts', {
              loader: 'ts',
              sourcemap: false,
              tsconfigRaw: { compilerOptions: {} },
            })
            return { code: result.code }
          }

          // Example files: imports are only referenced in the Svelte template,
          // so esbuild considers them unused. Append a synthetic re-export to
          // force preservation, then strip it from the output.
          //
          // IMPORTANT: only add names from regular `import { }` statements to
          // the sentinel — never names from `import type { }`. The sentinel
          // makes esbuild keep the import statement (because the name now has a
          // value usage), but `export type Foo` is not a real runtime binding.
          // If such a name survives the sentinel strip Vite raises at load time:
          // "does not provide an export named 'Foo'".
          //
          // Rule: use `import type { TypeName }` (separate from value imports)
          // for any TypeScript-only name from local modules — then the regex
          // below never captures it and esbuild correctly elides it.
          const importNames = new Set<string>()
          const importRe = /import\s+\{([^}]+)\}\s+from\s+['"][^'"]+['"]/g
          let m: RegExpExecArray | null
          while ((m = importRe.exec(content)) !== null) {
            for (const name of m[1].split(',')) {
              const raw = name.trim()
              // Skip inline `type` modifiers: `import { type Foo, Bar }` → skip Foo
              if (raw.startsWith('type ')) continue
              const trimmed = raw.split(/\s+as\s+/).pop()!.trim()
              if (trimmed) importNames.add(trimmed)
            }
          }
          // Also handle default imports: import Foo from '...'
          // Only PascalCase/UPPER_CASE names — lowercase defaults (e.g. `import d3 from 'd3'`)
          // are never used as template-level bindings so we intentionally skip them.
          const defaultRe = /import\s+([A-Z_$][\w$]*)\s+from\s+['"][^'"]+['"]/g
          while ((m = defaultRe.exec(content)) !== null) {
            importNames.add(m[1])
          }
          // Use a uniquely-named const as the sentinel so we can strip it by name
          // rather than relying on "last export statement" position, which would
          // silently corrupt files that already end with a legitimate export {}.
          const MARKER = '__UNOVIS_SENTINEL__'
          const sentinel = importNames.size
            ? `\nconst ${MARKER} = { ${[...importNames].join(', ')} }`
            : ''
          const input = sentinel ? content + sentinel : content
          const result = await transformWithEsbuild(input, filename ?? 'script.ts', {
            loader: 'ts',
            sourcemap: false,
            tsconfigRaw: { compilerOptions: {} },
          })
          // Strip the synthetic sentinel const
          const code = sentinel
            ? result.code.replace(new RegExp(`\\nconst ${MARKER}[^;]+;\\n?`), '\n')
            : result.code
          return { code }
        },
      },
      hot: false,
    }),
  ],
  resolve: {
    // Two svelte copies in the monorepo (3.x via @unovis/svelte build-time, 4.x
    // installed here) break Svelte contexts — the wrappers and the example file
    // must share one runtime so `getContext`/`setContext` see each other.
    dedupe: ['svelte', 'vue', 'react', 'react-dom', 'solid-js'],
    // `svelte` package.json conditionally exports `browser`→runtime/index.js and
    // `default`→runtime/ssr.js. Without explicit conditions Vite 7 sometimes
    // resolves to ssr.js (which uses noops for onMount) — force the browser path.
    conditions: ['browser', 'svelte', 'module', 'default'],
    alias: {
      // Mirror the workspace path aliases that `@unovis/ts` uses internally via
      // tsconfig `paths` (see packages/ts/tsconfig.json). Webpack does the same
      // in packages/dev/webpack.config.js. Order matters — more specific first.
      '@/types/': `${pkgSrc('ts')}/types/`,
      '@/utils/': `${pkgSrc('ts')}/utils/`,
      '@/core/': `${pkgSrc('ts')}/core/`,
      '@/components/': `${pkgSrc('ts')}/components/`,
      '@/containers/': `${pkgSrc('ts')}/containers/`,
      '@/styles/': `${pkgSrc('ts')}/styles/`,
      '@/data-models/': `${pkgSrc('ts')}/data-models/`,
      '@/data/': `${pkgSrc('ts')}/data/`,
      // Used in packages/react/src/html-components/**/index.tsx
      'src/utils/react': `${pkgSrc('react')}/utils/react`,
      '@unovis/ts': pkgSrc('ts'),
      '@unovis/react': pkgSrc('react'),
      // Vue and Svelte framework wrappers point at their built dist/ rather than
      // src/. Their source SFCs use TS generics (Vue) and `$$Generic` (Svelte)
      // that the SFC compilers can't resolve through the workspace alias chain.
      // The dist already contains pre-compiled wrappers that just import
      // `@unovis/ts` — which still resolves to live source via the alias above,
      // so unreleased core component changes still HMR into every preview.
      '@unovis/vue': pkgDist('vue'),
      '@unovis/solid': pkgSrc('solid'),
      '@unovis/svelte': pkgSrc('svelte'),
      // @unovis/angular's dist/ is only produced by `ng build`; point at source
      // (public-api) so it resolves without a prior build, like solid/svelte.
      '@unovis/angular': `${pkgSrc('angular')}/public-api.ts`,
    },
  },
  server: {
    port: 9600,
    strictPort: true,
    fs: {
      allow: [resolve(here, '..', '..')],
    },
  },
  optimizeDeps: {
    // Skip Vite's pre-bundling for Svelte entry points. Vite splits `svelte` and
    // `svelte/internal` into separate ESM chunks during pre-bundling — each with
    // its OWN module-level `current_component` and `render_callbacks`. That means
    // `onMount` (from `svelte`) pushes to one queue while `init`/`flush` (from
    // `svelte/internal`) operate on a different queue, and onMount callbacks
    // silently never fire. Routing both imports to the raw source ensures one
    // module instance.
    exclude: [
      '@unovis/ts', '@unovis/react', '@unovis/vue', '@unovis/solid', '@unovis/svelte', '@unovis/angular',
      'svelte', 'svelte/internal', 'svelte/internal/disclose-version',
      'svelte/animate', 'svelte/easing', 'svelte/motion', 'svelte/store', 'svelte/transition',
    ],
  },
})
