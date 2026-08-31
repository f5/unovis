import { defineConfig } from 'vite'
import type { ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import solid from 'vite-plugin-solid'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'

const here = fileURLToPath(new URL('.', import.meta.url))
const pkgSrc = (name: string): string => resolve(here, '..', name, 'src')
const pkgDist = (name: string): string => resolve(here, '..', name, 'dist')

export default defineConfig({
  root: 'gallery-dev-server',
  plugins: [
    // Opt-in Content-Security-Policy for verifying the @unovis/ts Emotion nonce
    // fix end-to-end. Enable with `UNOVIS_CSP=1 pnpm dev:gallery`. Sets a real
    // response header (browser-enforced, not just a meta tag) and injects a
    // pre-bundle script that seeds `window.UNOVIS_NONCE` so Emotion's cache
    // reads it before any `injectGlobal` runs.
    ...(process.env.UNOVIS_CSP
      ? [{
        name: 'unovis-csp-nonce-test',
        configureServer (server: ViteDevServer) {
          const nonce = process.env.UNOVIS_CSP_NONCE || 'unovis-dev-nonce'
          server.middlewares.use((_req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => {
            res.setHeader(
              'Content-Security-Policy',
              [
                "default-src 'self'",
                // <script> blocks & module URLs — nonce-gated
                `script-src-elem 'self' 'nonce-${nonce}'`,
                // Inline event handlers (onclick="…") — always blocked
                "script-src-attr 'none'",
                // Vite dev needs eval; both -elem and -attr inherit from here
                `script-src 'self' 'nonce-${nonce}' 'unsafe-eval'`,
                // <style> blocks & external stylesheets — nonce-gated for
                // inline, plus `https:` so 3rd-party CSS (Google Fonts,
                // Bootstrap Icons CDN, etc.) still loads.
                `style-src-elem 'self' 'nonce-${nonce}' https:`,
                // Inline style="…" attributes — nonces don't cover these (CSP3
                // limitation), and d3 / leaflet / Vite's error overlay all set
                // them at runtime. Kept permissive; not what we're verifying.
                "style-src-attr 'unsafe-inline'",
                `style-src 'self' 'nonce-${nonce}'`,
                "img-src 'self' data: blob:",
                // Unovis loads Font Awesome from cdnjs for graph icons (see
                // packages/ts/src/core/container/index.ts). Consumers who
                // self-host fonts can tighten this to `'self' data:`.
                "font-src 'self' data: https:",
                "connect-src 'self' ws: wss: http: https:",
                // ELK.js (elk-layered-graph example) spawns its layout engine
                // in a Worker created from a `Blob` URL — falls back to
                // script-src otherwise, which doesn't allow blob:.
                "worker-src 'self' blob:",
              ].join('; ')
            )
            next()
          })
        },
        // Runs after other plugins (React Refresh preamble, Vite HMR client)
        // so their injected inline <script>/<style> tags also receive the nonce.
        transformIndexHtml: {
          order: 'post' as const,
          handler (html: string) {
            const nonce = process.env.UNOVIS_CSP_NONCE || 'unovis-dev-nonce'
            const addNonce = (tag: 'script' | 'style', input: string): string =>
              input.replace(
                new RegExp(`<${tag}(?![^>]*\\snonce=)([^>]*)>`, 'gi'),
                `<${tag} nonce="${nonce}"$1>`
              )
            const withNonces = addNonce('style', addNonce('script', html))
            // Runtime shim: stamp the nonce onto every <style>/<link> created
            // via `document.createElement` AND onto any such node inserted via
            // appendChild/insertBefore (covers Solid's cloneNode template
            // pattern, Vite HMR CSS updates, Vue's `styleInject`, Angular's
            // SharedStylesHost, etc.). A MutationObserver would fire too late
            // — the CSP check runs synchronously during insertion.
            const bootstrap = `
              window.UNOVIS_NONCE = ${JSON.stringify(nonce)};
              (function () {
                var n = window.UNOVIS_NONCE;
                if (!n) return;
                function stamp (node) {
                  if (!node) return;
                  if (node.nodeType === 1) {
                    var tag = node.tagName;
                    if ((tag === 'STYLE' || tag === 'LINK') && !node.getAttribute('nonce')) {
                      node.setAttribute('nonce', n);
                    }
                  }
                  if (node.querySelectorAll) {
                    var list = node.querySelectorAll('style, link');
                    for (var i = 0; i < list.length; i++) {
                      if (!list[i].getAttribute('nonce')) list[i].setAttribute('nonce', n);
                    }
                  }
                }
                var origCreate = document.createElement.bind(document);
                document.createElement = function (tag, opts) {
                  var el = origCreate(tag, opts);
                  var t = String(tag).toLowerCase();
                  if (t === 'style' || t === 'link') el.setAttribute('nonce', n);
                  return el;
                };
                var origAppend = Node.prototype.appendChild;
                Node.prototype.appendChild = function (child) { stamp(child); return origAppend.call(this, child); };
                var origInsert = Node.prototype.insertBefore;
                Node.prototype.insertBefore = function (child, ref) { stamp(child); return origInsert.call(this, child, ref); };
              })();
            `.replace(/\s+/g, ' ').trim()
            return {
              html: withNonces,
              tags: [{
                tag: 'script',
                attrs: { nonce },
                children: bootstrap,
                injectTo: 'head-prepend' as const,
              }],
            }
          },
        },
      }]
      : []),
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
    // Solid plugin owns: example *-solid.tsx + every .tsx under @unovis/solid/src
    solid({ include: [/-solid\.tsx$/, /\/packages\/solid\/src\/.+\.tsx$/] }),
    // React plugin owns everything else .tsx (example React variants + @unovis/react/src)
    react({
      include: /\.tsx?$/,
      exclude: [/-solid\.tsx$/, /\/packages\/solid\/src\//, /\/packages\/vue\/src\//, /\/packages\/svelte\/src\//],
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
      '@unovis/ts', '@unovis/react', '@unovis/vue', '@unovis/solid', '@unovis/svelte',
      'svelte', 'svelte/internal', 'svelte/internal/disclose-version',
      'svelte/animate', 'svelte/easing', 'svelte/motion', 'svelte/store', 'svelte/transition',
    ],
  },
})
