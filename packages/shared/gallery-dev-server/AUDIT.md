# Gallery audit — framework discrepancies

Server: `pnpm run dev:gallery` (http://localhost:9600). 38 examples × 6 frameworks (React, Vue, Solid, Svelte, vanilla TS, Angular).

Angular renders via in-browser JIT rather than AOT: the workspace is pinned to Angular 12 (predates the AnalogJS Vite plugin), so the `unovis-angular-jit` plugin in `vite.config.ts` inlines each example's `templateUrl` and transpiles the decorator sources, and `mounts/angular.ts` bootstraps them with `platformBrowserDynamic` + `@angular/compiler`. Because `@angular/core`'s compile switches only flip to Ivy under ngtsc (the CLI/AnalogJS), this JIT path runs in **View Engine** mode — legitimate, but stricter: it needs a host component (can't bootstrap a component type directly) and rejects self-closed custom tags (`<vis-donut />`), which the plugin normalizes.

Method: an iframe walked every `?example=<slug>`, waited 1.2s, and recorded SVG/Leaflet presence, container height, and `.panel-error` content. Selected screenshots confirm the visual results.

---

## Hard failures (panel doesn't render at all)

| Example | Framework | Symptom | Root cause |
|---|---|---|---|
| `basic-scatter-plot` | **Vue** | Empty panel; DOM shows lowercased custom tags `<visxycontainer>` etc. | `.vue` file uses `<script lang="ts">` (Options API). Components imported via `import { VisXYContainer, ... }` are NOT auto-registered. Other Vue examples use `<script setup>` which does auto-register. |
| `patchy-line-chart` | **Vue** | Same — lowercased custom tags | Same: `.vue` file opens with `<template>` then has a bare `<script>` block (no `setup`). |
| `multi-line-chart` | **Vue** | Looks OK at first glance | `<script  setup lang="ts">` (note the double space). Vue tolerates it, but worth normalizing. |
| `custom-nodes-graph` | **vanilla TS** | TS panel shows only an empty `<div id="vis-container"></div>` | The example dir has both `custom-nodes-graph.ts` AND `constants.ts`. Our `pickTs` (gallery-dev-server/src/main.ts) returns the first non-excluded `*.ts` in the dir — alphabetically `constants.ts` wins, and that file is a helper, not a self-mounting example. |
| `leaflet-flow-map` | **vanilla TS** | Same — empty `#vis-container` | Same: `constants.ts` is picked instead of `leaflet-flow-map.ts`. |
| `range-plot` | **React** | Red panel-error: `TypeError: Cannot read properties of null (reading 'useMemo')` | `range-plot.tsx` calls `useMemo` at **module top level** (line 9: `const lineData = useMemo(() => processLineData(data), [])`), violating React's rules-of-hooks. React 19 returns `null` for hook calls outside a component. |

Visual confirmation:
- `basic-scatter-plot`: Vue cell is blank while React/Solid/Svelte all show identical scatter plots.
- `range-plot`: React cell shows the stack-trace; Vue/Solid/Svelte/TS render the dumbbell plot.

---

## Soft inconsistencies (renders, but unequally across frameworks)

These are not preview-app bugs — they live in the example source files themselves. Each example uses a different `height` value per framework, so the side-by-side panels look uneven.

| Example | React | Vue | Solid | Svelte | TS (default 300) |
|---|---|---|---|---|---|
| `basic-line-chart` | `'50vh'` | `600` | `'50dvh'` | `600` | — |
| `basic-sankey` | `'50vh'` | `400` | `'50dvh'` | `400` | n/a |
| `dagre-graph` | `'60vh'` | `600` | `'50dvh'` | `600` | n/a |
| `parallel-graph` | (varies, 1105) | `300` | `'50dvh'` | `300` | `150` |
| `patchy-line-chart` | `'50vh'` | `300` | `'50dvh'` | `'50vh'` | (uses container) |
| `plotband-plotline` | `600` | `600` | `600` | `300` | `300` |
| `sunburst-nested-donut` | (840) | (840) | (840) | `300` | (840) |

The Solid examples consistently use `'50dvh'` (dynamic viewport) while React uses `'50vh'`, and Vue/Svelte typically use a hard pixel number. This is most visible in `parallel-graph` where TS gets just 150px vs React's 1105px.

`stacked-area-chart`, `baseline-area-chart`, `basic-grouped-bar`, `basic-sankey`, `brush-grouped-bar`, `data-gap-line-chart`, `dagre-graph`, `step-area-chart` show the same pattern.

---

## Healthy examples (all 5 frameworks render comparable charts)

`advanced-leaflet-map`, `basic-annotations`, `basic-donut-chart`, `basic-leaflet-map`, `basic-timeline`, `crosshair-stacked-bar`, `dual-axis-chart`, `elk-layered-graph`, `expandable-sankey`, `force-graph`, `free-brush-scatters`, `hierarchical-chord-diagram`, `horizontal-stacked-bar-chart`, `non-stacked-area-chart`, `shaped-scatter-plot`, `sized-scatter-plot`, `stacked-area-chart`, `stacked-area-chart-with-attributes`, `synced-crosshairs`, `topojson-map`, `treemap`.

---

## Suggested fixes (for the next pass)

1. **`pickTs` in [main.ts](src/main.ts)** — match the entry-point filename to the slug instead of "first non-excluded `.ts`". Either:
   - require the entry file to be named `<slug>.ts`, or
   - extend the exclude list with `constants.ts`. (`<slug>.ts` matching is more robust and would automatically skip any other helper file.)
2. **`basic-scatter-plot.vue`, `patchy-line-chart.vue`, `multi-line-chart.vue`** — convert to `<script setup lang="ts">` (or add an explicit `export default { components: { VisXYContainer, ... } }`).
3. **`range-plot.tsx`** — move the `useMemo` call inside the component body. The existing webpack dev silently tolerates the hooks-rules violation; React 19 in this Vite setup does not.
4. **Per-framework heights** — pick one convention (`'50vh'`? a pixel value?) and apply it uniformly to all five variants of each example.
