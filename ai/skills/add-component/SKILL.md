---
name: add-component
description: >-
  Add a new visualization component to Unovis end to end — the TypeScript core, the shared
  registry, the generated framework wrappers, a dev example, a gallery example, and docs. Use when
  asked to add/create a new component, chart type, plot, or diagram to the library, or to wire an
  existing core component through to the framework wrappers.
---

# Adding a component to Unovis

Operational checklist. For the conceptual tutorial (data models, SVG vs HTML, transitions) read
`packages/website/contributing/guides/adding-a-component.mdx`. **Before writing anything, open a
similar existing component and copy its shape** — e.g. `packages/ts/src/components/line` (XY) or
`packages/ts/src/components/donut` (Core).

## 1. Build the core in `packages/ts`

Create `packages/ts/src/components/<kebab-name>/` (kebab-case dir + files):

- **`config.ts`** — `ConfigInterface` (JSDoc each prop, end with `Default: \`...\``) and a `Config`
  class with defaults. Extend the right superclass: `XYComponentConfig*` for XY components,
  `ComponentConfig*` for Core components. Stand-alone components don't extend.
- **`index.ts`** — the component class. Extends `XYComponentCore` / `ComponentCore` (or stands
  alone). Declares `static selectors = s`, `static cssVariables = s.variables`, `config`, `events`,
  and a `_render(customDuration?)` (or `render`) with clear **enter / update / exit** D3 selections.
- **`style.ts`** — emotion `css` selectors + a `cssVarDefaults` map. CSS variables are named
  `--vis-<component>-<selector>-<property>`; every color var needs a `--vis-dark-...` counterpart.
  Export `variables = getCssVarNames(cssVarDefaults)` and call `injectGlobalCssVariables(...)`.
- **`types.ts`** — component-specific types (optional).
- **`modules/`** — extract long render logic into `call`-able helpers (optional).

Match the house style: no semicolons, single quotes, 2-space indent, explicit return types.

## 2. Export from core

- Add the component (and its public config/types) to `packages/ts/src/components.ts`.
- If you expose new public types, also export them from `packages/ts/src/types.ts`.

## 3. Register in the shared registry

Add **one entry** to `getComponentList()` in `packages/shared/integrations/components.ts`. This is
the source of truth for the wrapper generators **and** for commitlint's `Component` scope.

XY component:
```ts
{ name: 'YourComponent', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/your-component'], dataType: 'Datum[]', angularProvide: 'VisXYComponent' },
```
Core (single) component:
```ts
{ name: 'YourComponent', sources: [coreComponentConfigPath, '/components/your-component'], dataType: 'Datum[]', angularProvide: 'VisCoreComponent' },
```
Optional fields seen in the file: `kebabCaseName` (when the auto kebab is wrong, e.g.
`TopoJSONMap` → `topojson-map`), `elementSuffix`, `isStandAlone`, `renderIntoProvidedDomNode`,
`angularStyles` / `svelteStyles` / `vueStyles` / `solidStyles`.

## 4. Generate the wrappers

For each wrapper package, run generate from its directory (or via filter):
```bash
cd packages/react   && pnpm generate
cd packages/angular && pnpm generate
cd packages/svelte  && pnpm generate
cd packages/vue     && pnpm generate
cd packages/solid   && pnpm generate
```
- **Never hand-edit generated files** (they start with `// !!! This code was automatically
  generated !!!`). If a wrapper looks wrong, fix the core config or the shared TS parser
  (`packages/shared/integrations`) and regenerate — don't patch the output.
- **Barrels:** Solid/Svelte/Vue update `src/components.ts` automatically; for **React and Angular**
  add the export line to `packages/{react,angular}/src/components.ts` by hand. Verify every
  wrapper's `src/components.ts` includes your component.

## 5. Dev example (`packages/dev`)

Add at least one page under `packages/dev/src/examples/<category>/<component>/<example>/index.tsx`,
exporting `title`, `subTitle`, and a `component`. Add/extend the component-level
`.../<component>/index.tsx` group index. Verify with `pnpm dev` (http://localhost:9500).

## 6. Gallery example

Follow `/add-gallery-example` (files in `packages/shared/examples/<slug>/` + `examples-list.tsx` +
light/dark previews).

## 7. Docs (`packages/website`)

Add `packages/website/docs/<category>/<Name>.mdx` (e.g. `xy-charts/`, `misc/`). Structure: Basic
Configuration → CSS Variables → Events → Component Props. Use the helpers `DocWrapper`,
`PropsTable`, `CSSVariables`. Verify with `pnpm website` (http://localhost:9300).

## 8. Verify & commit

- `pnpm build:ts` compiles; `pnpm lint` clean; component renders in `pnpm dev`; wrappers exist in
  every `src/components.ts`.
- Commit with the 4-group convention and open the PR — see `/commit` and `/open-pr`.

**Done when:** core compiles, a dev page exists, every wrapper exports it, it has a gallery example,
and it has a docs page.
