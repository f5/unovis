import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import ts from 'typescript'
import { build, transformWithEsbuild } from 'vite'
import { JSDOM, VirtualConsole } from 'jsdom'

import { cases, width, height } from './constants'

interface Component {
  config: { color: string; lineWidth: number };
  datamodel: { data: { x: number; y: number }[] };
  element: Element;
  isDestroyed: () => boolean;
}

interface Container {
  config: { xAxis?: Component; yAxis?: Component };
}

interface Fixture {
  components: () => Record<string, Component>;
  update: (action: string) => void;
  destroy: () => void;
  containers: Container[];
}

const require = createRequire(import.meta.url)
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

async function bundle (runtime: string, fixture: string): Promise<string> {
  const compiler = require(`${runtime}/compiler`)
  const entryId = resolve(root, 'test/compat-entry.js')
  const entry = `
    import App from ${JSON.stringify(resolve(root, 'test/fixtures', fixture))}
    import { XYContainer } from '@unovis/ts/containers/xy-container'
    ${runtime === 'svelte' ? "import { mount, unmount } from 'svelte'" : ''}
    const containers = []
    const updateContainer = XYContainer.prototype.updateContainer
    XYContainer.prototype.updateContainer = function (...args) {
      if (!containers.includes(this)) containers.push(this)
      return updateContainer.apply(this, args)
    }
    const app = ${runtime === 'svelte' ? 'mount(App, { target: document.body })' : 'new App({ target: document.body })'}
    globalThis.fixture = {
      components: () => app.components(),
      update: action => app.update(action),
      destroy: () => ${runtime === 'svelte' ? 'unmount(app)' : 'app.$destroy()'},
      containers,
    }
  `
  const output = await build({
    configFile: false,
    logLevel: 'silent',
    resolve: {
      alias: [
        ...(runtime === 'svelte4' ? [{ find: /^svelte(?=\/|$)/, replacement: 'svelte4' }] : []),
        { find: '@unovis/ts', replacement: resolve(root, '../ts/dist') },
      ],
      dedupe: [runtime],
      conditions: ['browser', 'svelte', 'module', 'production'],
    },
    plugins: [{
      name: 'compat-svelte',
      async transform (source, filename) {
        if (!filename.endsWith('.svelte')) return
        const prepared = filename.startsWith(resolve(root, 'test/fixtures')) ? await compiler.preprocess(source, {
          script: async ({ content, attributes }: { content: string; attributes: Record<string, string> }): Promise<{ code: string } | undefined> => {
            if (attributes.lang !== 'ts') return
            return transformWithEsbuild(content, `${filename}.ts`, { tsconfigRaw: { compilerOptions: { verbatimModuleSyntax: true } } })
          },
        }, { filename }) : { code: source }
        return compiler.compile(prepared.code, {
          filename,
          generate: runtime === 'svelte4' ? 'dom' : 'client',
          css: 'injected',
          dev: false,
        }).js
      },
    }],
    build: {
      write: false,
      minify: false,
      lib: { entry: entryId, formats: ['iife'], name: 'Compat' },
      rollupOptions: { plugins: [{ name: 'compat-entry', resolveId: id => id === entryId ? id : undefined, load: id => id === entryId ? entry : undefined }] },
    },
  })
  const result = Array.isArray(output) ? output[0] : output
  assert('output' in result)
  const chunk = result.output.find(item => item.type === 'chunk')
  assert(chunk?.type === 'chunk')
  return chunk.code
}

async function settle (window: JSDOM['window']): Promise<void> {
  await new Promise<void>(resolve => window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve())))
}

function path (component: Component): string | null {
  return component.element.querySelector('path')?.getAttribute('d') ?? null
}

for (const runtime of new Set(cases.map(c => c.runtime))) {
  test(`${runtime}: every packaged component compiles for client and SSR`, () => {
    const compiler = require(`${runtime}/compiler`)
    for (const group of ['components', 'html-components', 'containers']) {
      for (const name of readdirSync(resolve(root, 'dist', group))) {
        const filename = resolve(root, 'dist', group, name, `${name}.svelte`)
        const source = readFileSync(filename, 'utf8')
        for (const generate of runtime === 'svelte4' ? ['dom', 'ssr'] : ['client', 'server']) {
          assert(compiler.compile(source, { filename, generate }).js.code)
        }
      }
    }
  })
}

for (const { runtime, fixture } of cases) {
  test(`${runtime}: ${fixture} packaged reactivity`, async () => {
    const runtimeDir = dirname(require.resolve(`${runtime}/package.json`))
    const program = ts.createProgram([resolve(root, 'test/fixtures/types.ts')], {
      noEmit: true,
      skipLibCheck: true,
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      baseUrl: root,
      paths: {
        svelte: [resolve(runtimeDir, 'types/index.d.ts')],
        'svelte/*': [resolve(runtimeDir, '*')],
        '@unovis/ts/*': [resolve(root, '../ts/dist/*')],
      },
    })
    const diagnostics = ts.getPreEmitDiagnostics(program)
    assert.equal(diagnostics.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('\n'), '')
    const code = await bundle(runtime, fixture)
    const errors: Error[] = []
    const virtualConsole = new VirtualConsole()
    virtualConsole.on('jsdomError', error => errors.push(error))
    const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost', virtualConsole })
    const { window } = dom
    Object.defineProperties(window.HTMLElement.prototype, {
      clientWidth: { get: () => width },
      clientHeight: { get: () => height },
    })
    Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', { value: () => null })
    Object.defineProperties(window.SVGElement.prototype, {
      getBBox: { value: () => ({ x: 0, y: 0, width: 20, height: 10 }) },
      getComputedTextLength: { value: () => 20 },
    })
    try {
      window.eval(code)
      await settle(window)
      const app = (window as unknown as { fixture: Fixture }).fixture
      let components = app.components()
      assert(components.child && components.owned && components.donut && components.legend)
      assert(path(components.child), errors.map(e => e.stack).join('\n'))
      const initial = path(components.child)
      app.update('replace-child')
      await settle(window)
      assert.equal(components.child.datamodel.data[1].y, 1)
      assert.notEqual(path(components.child), initial)
      const replaced = path(components.child)
      app.update('mutate-child')
      await settle(window)
      assert.equal(components.child.datamodel.data[1].y, 7)
      assert.notEqual(path(components.child), replaced)
      const owned = path(components.owned)
      app.update('replace-container')
      await settle(window)
      assert.equal(components.owned.datamodel.data[1].y, 1)
      assert.notEqual(path(components.owned), owned)
      const replacedOwned = path(components.owned)
      app.update('mutate-container')
      await settle(window)
      assert.equal(components.owned.datamodel.data[1].y, 8)
      assert.notEqual(path(components.owned), replacedOwned)
      app.update('replace-single')
      await settle(window)
      assert.equal(components.donut.datamodel.data[0].y, 5)
      app.update('config')
      await settle(window)
      assert.equal(components.child.config.color, '#0000ff')
      assert.equal(components.child.config.lineWidth, 5)
      assert(window.document.body.textContent?.includes('After'))
      app.update('mutate-legend')
      await settle(window)
      assert(window.document.body.textContent?.includes('Mutated'))
      assert.equal(window.document.querySelector('#child svg')?.getAttribute('height'), '300')
      app.update('axis-type')
      await settle(window)
      assert.equal(app.containers[0].config.xAxis, undefined)
      assert.equal(app.containers[0].config.yAxis, components.axis)
      app.update('axis-type')
      await settle(window)
      assert.equal(app.containers[0].config.yAxis, undefined)
      assert.equal(app.containers[0].config.xAxis, components.axis)
      app.update('toggle-axis')
      await settle(window)
      assert(components.axis.isDestroyed())
      assert.equal(app.containers[0].config.yAxis, undefined)
      assert.equal(app.containers[0].config.xAxis, undefined)
      app.update('toggle-child')
      app.update('toggle-donut')
      await settle(window)
      assert(components.child.isDestroyed())
      assert(components.donut.isDestroyed())
      app.update('toggle-child')
      app.update('toggle-donut')
      await settle(window)
      const remounted = app.components()
      assert.notEqual(remounted.child, components.child)
      assert.notEqual(remounted.donut, components.donut)
      assert(path(remounted.child))
      components = remounted
      app.update('clear-data')
      await settle(window)
      assert.equal(components.child.datamodel.data.length, 0)
      assert.equal(components.owned.datamodel.data.length, 0)
      assert.equal(components.donut.datamodel.data.length, 0)
      assert.equal(components.child.element.querySelector('path')?.getAttribute('stroke-opacity'), '0')
      assert.equal(components.owned.element.querySelector('path')?.getAttribute('stroke-opacity'), '0')
      app.update('replace-child')
      app.update('replace-container')
      app.update('replace-single')
      await settle(window)
      app.update('toggle-charts')
      await settle(window)
      assert(components.child.isDestroyed())
      assert(components.owned.isDestroyed())
      assert(components.donut.isDestroyed())
      assert.equal(window.document.querySelectorAll('vis-xy-container, vis-single-container').length, 0)
      app.update('toggle-charts')
      await settle(window)
      assert(path(app.components().child))
      app.destroy()
      await settle(window)
      assert.equal(window.document.querySelectorAll('vis-xy-container, vis-single-container').length, 0)
      assert.deepEqual(errors, [])
    } finally {
      window.close()
    }
  })
}
