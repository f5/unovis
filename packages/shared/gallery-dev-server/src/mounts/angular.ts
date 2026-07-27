// Angular JIT mount. The workspace is pinned to Angular 12, which predates the
// AnalogJS Vite plugin, so instead of AOT we compile in the browser. `zone.js`
// (change detection) and `@angular/compiler` (JIT template compilation) are
// imported dynamically inside `mountAngular` rather than at module load: zone.js
// monkey-patches global setTimeout/Promise/etc., and loading it eagerly would
// alter the other framework panels on every page — including examples with no
// Angular variant.
//
// Note on Ivy: `@angular/core`'s compile switches default to the View Engine
// path and are only flipped to Ivy by the Angular compiler (ngtsc, via the CLI /
// AnalogJS) at build time. A plain in-browser transform can't flip them, so JIT
// here runs in View Engine mode. Under View Engine you can't bootstrap a
// component *type* directly (that needs `entryComponents`); instead we bootstrap
// a tiny host component whose template contains the example's selector, which
// the JIT compiler resolves against the example module's exports.
type ModuleNamespace = Record<string, unknown>

// The last bootstrapped app. `platformBrowserDynamic()` is a page-global
// singleton, so we destroy the previous module before bootstrapping a new one —
// otherwise a re-mount (future client-side nav / HMR) would stack modules that
// all define `gallery-ng-host` and leak their change-detection loops.
let activeRef: { destroy(): void } | null = null

// The example files use named exports (`BasicBoxplotModule`, `BasicBoxplotComponent`);
// grab the class whose name matches the expected suffix.
// eslint-disable-next-line @typescript-eslint/ban-types
const pickClass = (ns: ModuleNamespace, suffix: RegExp): Function => {
  for (const [name, value] of Object.entries(ns)) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    if (typeof value === 'function' && suffix.test(name)) return value as Function
  }
  throw new Error(`no export matching ${suffix}`)
}

// Read the component selector from its decorator metadata. View Engine stores it
// under `__annotations__`; the Ivy branch is a fallback in case the switch ever
// flips (e.g. a future AnalogJS-based setup).
const readSelector = (component: Record<string, unknown>): string => {
  const c = component as {
    // Angular-internal metadata property names, referenced as-is.
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __annotations__?: Array<{ selector?: string }>;
    ɵcmp?: { selectors: Array<Array<string>> };
  }
  const fromVe = c.__annotations__?.[0]?.selector
  if (fromVe) return fromVe
  const fromIvy = c.ɵcmp?.selectors?.[0]?.[0]
  if (typeof fromIvy === 'string') return fromIvy
  throw new Error('could not read component selector')
}

export async function mountAngular (
  target: HTMLElement,
  moduleNs: ModuleNamespace,
  componentNs: ModuleNamespace
): Promise<void> {
  // zone.js and @angular/compiler are already loaded by the caller in main.ts
  // before the example module files are imported (which transitively pull in
  // @angular/core → @angular/common whose static initialisers need the compiler).

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { Component, NgModule } = await import('@angular/core')
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { BrowserModule } = await import('@angular/platform-browser')
  const { platformBrowserDynamic } = await import('@angular/platform-browser-dynamic')

  activeRef?.destroy()
  activeRef = null

  const exampleModule = pickClass(moduleNs, /Module$/)
  const exampleComponent = pickClass(componentNs, /Component$/)
  const selector = readSelector(exampleComponent)

  // Fresh host node per mount so re-selecting an example doesn't stack panels.
  // Angular's bootstrap looks for an element matching the host component's
  // selector, so we drop one into the panel.
  const hostEl = document.createElement('gallery-ng-host')
  target.replaceChildren(hostEl)

  @Component({ selector: 'gallery-ng-host', standalone: false, template: `<${selector}></${selector}>` })
  class GalleryHostComponent {}

  @NgModule({
    imports: [BrowserModule, exampleModule],
    declarations: [GalleryHostComponent],
    bootstrap: [GalleryHostComponent],
  })
  class GalleryHostModule {}

  activeRef = await platformBrowserDynamic().bootstrapModule(GalleryHostModule)
}
