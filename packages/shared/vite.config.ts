import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import solid from 'vite-plugin-solid'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'

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
    // declaring `lang="ts"`. `svelte-preprocess` (also used by the published
    // build via packages/svelte/svelte.config.js) treats every script as TS,
    // strips type-only imports, and handles `$$Generic`.
    // `hot: false` disables svelte-hmr's proxy wrapping. The proxy breaks
    // Svelte's lifecycle when we mount via `new Component({target})` outside a
    // tracked container — onMount callbacks never fire under the proxy here.
    svelte({
      preprocess: sveltePreprocess({ typescript: { tsconfigFile: false } }),
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
      'types/': `${pkgSrc('ts')}/types/`,
      'utils/': `${pkgSrc('ts')}/utils/`,
      'core/': `${pkgSrc('ts')}/core/`,
      'components/': `${pkgSrc('ts')}/components/`,
      'containers/': `${pkgSrc('ts')}/containers/`,
      'styles/': `${pkgSrc('ts')}/styles/`,
      'data-models/': `${pkgSrc('ts')}/data-models/`,
      'data/': `${pkgSrc('ts')}/data/`,
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
