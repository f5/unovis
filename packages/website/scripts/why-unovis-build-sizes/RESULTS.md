# Bundle size of an equivalent line chart in nine JavaScript charting libraries

Measured 2026-09-22; Observable Plot and Vega-Lite were added on 2026-10-09 and TanStack Charts 1.1.0 on 2026-10-13. On
2026-10-13 every library was re-measured for the chart below, which now asks for smooth lines, a crosshair and animation,
the behavior a Unovis line chart has out of the box. The Unovis rows measure the repository build (the stack `main` +
[#938](https://github.com/f5/unovis/pull/938) + [#937](https://github.com/f5/unovis/pull/937) +
[#939](https://github.com/f5/unovis/pull/939), commit `2d97a322`), with the published 1.7.1 kept as reference rows. Every
number here is reproduced by `./measure.sh` (see [Reproduce](#reproduce)).

**The chart:** 3 smooth (monotone) line series × 24 points, an x and a y axis (with grid lines), a legend, a hover
tooltip that lists all three series at the hovered x, a crosshair line at that x, and animation. Every library gets the
same data module, the same three series colors, the full container width and a height of 300 px. Each one is written
with that library's own idiomatic imports and options, tree-shaken where the library supports it (see
[Method](#method) for the options). Where a library can't do part of it, it's measured without that part: Observable
Plot and Vega-Lite have no animation, AG Charts Community has neither the crosshair nor animation (both are Enterprise
modules), and Nivo animates data updates but not the first render.

**Sizes:** production bundle built with esbuild. **min** = minified bytes, **gzip** = `gzip -9`,
**brotli** = brotli quality 11. **1 KB = 1,024 bytes.** Each table is sorted by gzip size. Exact byte
counts are in [Raw numbers](#raw-numbers).

## React (React and ReactDOM excluded)

| # | Library | Imports used | min (KB) | gzip (KB) | brotli (KB) | Notes |
|---:|---|---|---:|---:|---:|---|
| 1 | Unovis, repository build (`@unovis/react`) | `VisXYContainer, VisLine, VisAxis, VisCrosshair, VisTooltip, VisBulletLegend` | 164.0 | 52.8 | 46.7 | SVG. Monotone curves, the crosshair and animation are the defaults. Only the 6 used components are bundled (76.9 KB); the rest is d3 modules (77.1 KB), the React wrapper (4.4 KB) and the built-in CSS runtime's stylis (4.0 KB). The published 1.7.1 is 206.5 / 67.1 / 59.1 (reference rows below): #938 removed the `Scale` object and the `ResizeObserver` polyfill, #937 replaced Emotion. |
| 2 | TanStack Charts 1.1.0 (`@tanstack/charts/react/core`) | `Chart` with the `motion()` renderer and a `defineChart` of `lineY` with `d3Curve(curveMonotoneX)`, `focusGuideX`, compact `scaleLinear`/`scaleOrdinal`, `colorLegend`, `focus: 'group-x'` and `tooltip` | 161.3 | 54.7 | 47.8 | SVG. `motion.js` alone is 44.5 KB; `d3Curve` brings d3-shape and d3-path (6.8 KB), everything else is `@tanstack/charts`. Its defaults are lighter: straight lines, no crosshair and no animation are 106.8 / 37.5, and the same chart with the `svgAnimation` update tween instead of `motion()` is 118.2 / 41.3 (reference rows, finding 11). |
| 3 | Chart.js 4.5.1 + react-chartjs-2 5.3.1 | `Line` from react-chartjs-2; `Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)`; a crosshair plugin | 162.1 | 56.8 | 49.9 | Canvas. `<Line>` registers `LineController` itself. Chart.js has no crosshair option, so the entry adds the usual few-line plugin (`libs/chartjs/crosshair-plugin.js`). The chart.js core accounts for 151.7 KB. |
| 4 | Observable Plot 0.6.17 | `Plot.plot` with `Plot.lineY`, `Plot.ruleX` + `Plot.pointerX` and `Plot.tip`, mounted in a `useEffect` (Plot has no React component) | 262.4 | 88.8 | 76.5 | SVG, no animation. Plot's own code is 114.7 KB. `Plot.plot` keeps every mark and scale reachable, so a line chart also bundles d3-geo (24.9 KB), d3-scale-chromatic (17.7 KB) and d3-zoom (finding 8). |
| 5 | Nivo 0.99.0 (`@nivo/line`) | `ResponsiveLine` | 270.5 | 93.6 | 80.1 | SVG. Animates data updates, not the first render. Includes react-spring (45.0 KB), lodash (31.3 KB) and d3-scale-chromatic (17.6 KB). A plain `npm install` bundles 287.6 / 98.4 KB instead (see finding 5). |
| 6 | Recharts 3.10.1 | `LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend` | 372.0 | 108.9 | 91.4 | SVG. Recharts' own code is 242.1 KB; it also pulls in Redux Toolkit, Immer, reselect and react-redux (32.9 KB), plus es-toolkit and decimal.js-light. The `react-is` peer dependency is bundled (2.0 KB). |
| 7 | ECharts 6.1.0 + echarts-for-react 3.0.6 | `echarts-for-react/lib/core` + `echarts/core` with `echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])` | 538.1 | 182.8 | 155.9 | Canvas. ECharts' documented tree-shaking approach. The wrapper adds 29.8 KB over the vanilla build (finding 4). |
| 8 | Vega-Lite 6.5.0 + react-vega 8.0.0 | `VegaEmbed` from react-vega (vega-embed 7.3.0, vega 6.4.0) with the documented multi-series tooltip spec | 825.4 | 284.5 | 243.0 | SVG (vega-embed's default renderer; Canvas is an option), no animation. The Vega-Lite compiler is 251.9 KB and the Vega runtime most of the rest; d3-geo, d3-hierarchy and d3-delaunay come along for a line chart (finding 9). react-vega adds 1.9 KB over vanilla vega-embed. |
| 9 | AG Charts Community 14.2.0 + ag-charts-react 14.2.0 | `AgCharts` + `ModuleRegistry.registerModules([LineSeriesModule, CategoryAxisModule, NumberAxisModule, LegendModule])` | 1,320.8 | 397.0 | 318.4 | Canvas, no crosshair and no animation (Enterprise modules). Registering modules is required in v14, but it barely reduces the bundle size (finding 1). |

For context, React 18.3.1 + ReactDOM (`react`, `react-dom/client`, `react/jsx-runtime`) come to
**140.0 KB min / 44.8 KB gzip / 39.1 KB brotli**. Add that to any row for an app that doesn't already ship React.

## Vanilla JavaScript (no framework)

| # | Library | Imports used | min (KB) | gzip (KB) | brotli (KB) | Notes |
|---:|---|---|---:|---:|---:|---|
| 1 | Unovis, repository build (`@unovis/ts`) | `XYContainer, Line, Axis, Crosshair, Tooltip, BulletLegend` from `@unovis/ts` | 159.5 | 52.2 | 45.8 | SVG. The root-barrel import tree-shakes to the same `@unovis/ts` code as the React wrapper's deep imports (76.9 KB in both). The published 1.7.1 is 201.5 / 66.2 / 58.0. |
| 2 | TanStack Charts 1.1.0 | `mountChartRenderer` from `@tanstack/charts/renderer` with `motion()` and the same definition | 158.8 | 53.9 | 47.0 | SVG. |
| 3 | Chart.js 4.5.1 | `Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)` and the crosshair plugin | 160.7 | 56.2 | 49.3 | Canvas. |
| 4 | Observable Plot 0.6.17 | `Plot.plot(...)` appended to the container | 262.2 | 88.6 | 76.4 | SVG. |
| 5 | ECharts 6.1.0 | `echarts/core` + `echarts.use([...])` as above, `echarts.init` | 508.3 | 172.5 | 147.3 | Canvas. |
| 6 | Vega-Lite 6.5.0 | `vegaEmbed(el, spec)` (vega-embed 7.3.0, vega 6.4.0) | 823.5 | 283.8 | 242.4 | SVG. |
| 7 | AG Charts Community 14.2.0 | `AgCharts.create` + the same 4 modules | 1,320.1 | 396.6 | 318.0 | Canvas. |

Recharts and Nivo are React-only.

**CSS:** none of the libraries needs a separate stylesheet. esbuild emitted no `.css` file for any entry.
Unovis (its built-in CSS runtime), AG Charts, Nivo (through react-virtualized-auto-sizer), Observable Plot (a `<style>`
element inside each SVG), vega-embed (the styles of its tooltip) and TanStack Charts (inline styles) style themselves from
JavaScript at runtime, so that CSS is already counted above. Recharts, ECharts and Chart.js use inline styles or canvas.

## Tree-shaking check (same chart, non-tree-shaken entry points)

| Library | Tree-shaken (min / gzip KB) | Convenience import (min / gzip KB) | Saving (min / gzip) |
|---|---:|---:|---:|
| Chart.js | 160.7 / 56.2 | `chart.js/auto`: 201.1 / 69.3 | −20.1% / −18.9% |
| ECharts | 508.3 / 172.5 | full `echarts`: 1,107.8 / 370.8 | −54.1% / −53.5% |
| AG Charts | 1,320.1 / 396.6 | `AllCommunityModule`: 1,366.2 / 410.0 | **−3.4% / −3.3%** |
| AG Charts | – | `import { ModuleRegistry }` alone, no modules, no chart: **1,303.4 / 391.6** | – |
| Unovis | 159.5 / 52.2 | – (the metafile shows only the 6 used components; no maps, graph or other components) | – |
| Observable Plot | 262.1 / 88.6 | – (`Plot.plot` keeps every mark reachable: d3-geo, d3-scale-chromatic and d3-zoom are bundled for a line chart) | – |
| Vega-Lite | 823.5 / 283.8 | – (the compiler and the whole Vega runtime are needed for any spec) | – |

## Cross-check with a second bundler (Rollup)

To make sure no result is an esbuild quirk, the same entry files were also bundled with Rollup 4.63.4
(`@rollup/plugin-node-resolve` + `@rollup/plugin-commonjs`, default tree-shaking, same externals) and
then minified with the same esbuild minifier and target (`crosscheck/rollup.mjs`).

| Variant | esbuild min / gzip (KB) | Rollup min / gzip (KB) |
|---|---:|---:|
| Unovis (React, repository build) | 164.0 / 52.8 | 161.9 / 51.7 |
| TanStack Charts (React) | 161.3 / 54.7 | 160.6 / 54.1 |
| Chart.js + react-chartjs-2 | 162.1 / 56.8 | 153.4 / 53.7 |
| Observable Plot (React) | 262.4 / 88.8 | 261.9 / 88.4 |
| Nivo | 270.5 / 93.6 | 265.1 / 91.9 |
| Recharts | 372.0 / 108.9 | 360.7 / 106.0 |
| ECharts + echarts-for-react | 538.1 / 182.8 | 531.5 / 180.2 |
| Vega-Lite + react-vega | 825.4 / 284.5 | 829.0 / 284.7 |
| AG Charts + ag-charts-react | 1,320.8 / 397.0 | 1,327.5 / 397.8 |
| Unovis (vanilla, repository build) | 159.5 / 52.2 | 157.9 / 51.2 |
| TanStack Charts (vanilla) | 158.8 / 53.9 | 158.2 / 53.3 |
| Chart.js (vanilla) | 160.7 / 56.2 | 152.0 / 53.2 |
| Observable Plot (vanilla) | 262.2 / 88.6 | 261.7 / 88.3 |
| ECharts (vanilla) | 508.3 / 172.5 | 502.6 / 170.1 |
| Vega-Lite (vanilla) | 823.5 / 283.8 | 827.2 / 284.0 |
| AG Charts (vanilla) | 1,320.1 / 396.6 | 1,326.8 / 397.4 |
| TanStack Charts, `svgAnimation` instead of `motion()` (React, reference) | 118.2 / 41.3 | 119.0 / 41.3 |
| TanStack Charts' defaults (React, reference) | 106.8 / 37.5 | 108.0 / 37.7 |
| AG Charts, `AllCommunityModule` | 1,366.2 / 410.0 | 1,376.6 / 411.7 |
| AG Charts, `import { ModuleRegistry }` only | 1,303.4 / 391.6 | 1,307.8 / 391.7 |
| Unovis 1.7.1 as published (React) | 206.5 / 67.1 | 203.3 / 65.5 |
| Unovis 1.7.1 as published (vanilla) | 201.5 / 66.2 | 198.9 / 64.8 |

The ranking is the same under both bundlers except for one pair: Chart.js and TanStack Charts, which Rollup puts 0.3 KB
gzip apart (React) and 0.1 KB (vanilla), swap places. For the sixteen compared variants, Rollup's output is 1.0–3.0%
smaller for Unovis, Nivo, Recharts and ECharts, 5.4–5.5% smaller for Chart.js (min and gzip), within 1.2% for Observable
Plot, Vega-Lite and TanStack Charts, and 0.5% larger for AG Charts. Under Rollup, Unovis stays 2.1 KB gzip under
Chart.js (React) and 1.9 KB (vanilla), while Chart.js is 8.5 KB smaller minified. The `chart.js/auto` reference build is
1.2% larger. Changing the esbuild target to `es2022` or `esnext` moves gzip sizes by 0.5% at most (`dist-es2022/`, `dist-esnext/`),
so the `es2020` target doesn't favor any library.

## Method

1. **Installs from npm, one isolated project per library.** `libs/<library>/package.json` pins the exact
   versions, and each project has its own `package-lock.json`, so no library can change another's
   dependency resolution or hoisting. (An early run that installed everything into one `node_modules` was
   off by up to 6%: Unovis, Recharts and Nivo got an extra copy of `d3-time`, and echarts-for-react
   resolved a different `tslib`.) React 18.3.1 and ReactDOM 18.3.1 are installed in every project so
   peer dependencies resolve the way they would in a real app. The lockfiles were created with
   `npm install` followed by `npm dedupe` (npm 11.12.1). That changed only Nivo's bundle: see finding 5.
   The Unovis rows measure the repository build: `measure.sh` packs `packages/ts/dist` and `packages/react/dist`
   (what `pnpm publish:ts` and `publish:react` upload) into `libs/unovis-local/` and installs them there with npm,
   without a lockfile, so their dependencies resolve the way they would for an app installing a new release. The
   published packages (`@unovis/ts@1.7.1`, `@unovis/react@1.7.1`, `libs/unovis/`) are measured as reference rows
   (`unovis-react-npm`, `unovis-ts-npm`); they reproduce the 1.7.0 numbers to within the 4 bytes gzip's header
   spends on the longer file name. Observable Plot has no React component: its docs recommend building the plot in a
   `useEffect` and appending it to a ref, which `libs/plot/plot-react.jsx` does. Vega-Lite renders through react-vega
   (the Vega organization's wrapper around vega-embed), with the spec shared by the React and vanilla entries.
2. **One entry file per library and variant** (`libs/<library>/*.js(x)`). Each renders the chart into
   `#app` with `createRoot(...).render(...)`, `new XYContainer(...)`, `echarts.init(...)`, `new Chart(...)`
   or `AgCharts.create(...)`, so nothing can be dead-code-eliminated. Data, series names and colors come from
   `libs/shared/data.js` in every bundle (0.3 KB). Colors are passed explicitly everywhere because
   tree-shaken Chart.js has no default palette and Recharts draws every `<Line>` in the same default
   color. Each library gets its own options for the rest of the chart:

   | Library | Smooth lines | Tooltip for all series | Crosshair | Animation |
   |---|---|---|---|---|
   | Unovis | default (`curveType: 'monotoneX'`) | `VisCrosshair` + `VisTooltip` | `VisCrosshair` | default (600 ms), first render and updates |
   | TanStack Charts | `curve: d3Curve(curveMonotoneX)` | `focus: 'group-x'` + `tooltip` | `focusGuideX` (a line and a marker per series) | the `motion()` renderer (`initial: 'always'`, 600 ms tween) |
   | Chart.js | `cubicInterpolationMode: 'monotone'` | `interaction: { mode: 'index', intersect: false }` | a few-line plugin (`crosshair-plugin.js`) | default |
   | Observable Plot | `curve: 'monotone-x'` | `Plot.tip` with `Plot.pointerX` | `Plot.ruleX` with `Plot.pointerX` | none, Plot doesn't animate |
   | Nivo | `curve="monotoneX"` | `enableSlices="x"` | drawn by the slices | default, updates only |
   | Recharts | `type="monotone"` | `<Tooltip>` | the `<Tooltip>` cursor | default |
   | ECharts | `smooth: true` | `tooltip.trigger: 'axis'` | the axis pointer that `trigger: 'axis'` draws | default |
   | Vega-Lite | `interpolate: 'monotone'` | a `pivot` transform and a `rule` with one tooltip per series | that `rule` | none, Vega-Lite doesn't animate |
   | AG Charts Community | `interpolation: { type: 'smooth' }` | `tooltip.mode: 'shared'` | none, `CrosshairModule` is Enterprise | none, `AnimationModule` is Enterprise |

3. **Bundling:** esbuild 0.28.2,
   `esbuild <entry> --bundle --minify --format=esm --platform=browser --target=es2020 --define:process.env.NODE_ENV='"production"'`,
   plus `--external:react --external:react-dom --external:react/jsx-runtime --jsx=automatic` for the React
   variants. `react-dom/client` is covered by `--external:react-dom`. Every metafile confirms that only
   those React entry points stayed external.
4. **Measuring:** min = size of the output file. gzip = exactly `gzip -9 -c <file> | wc -c` (Apple gzip
   479; the header includes the file name, so there's a constant ~20-byte overhead). brotli = Node 24.11.1
   `zlib.brotliCompressSync`, quality 11, text mode.
5. **Checks** (all passed):
   * **Metafile analysis** (`dist/report.md`): the top contributors of every bundle are the charting
     library itself (table below). A guard in `analyze.mjs` fails the run if any bundled file resolves
     from outside that library's own `libs/<library>/` install.
   * **Runtime smoke test** (`verify/verify.mjs`): each measured file is loaded unmodified in headless
     Chrome 153. The script checks that it runs without errors and draws SVG paths or canvas pixels. It
     then moves a real (trusted) mouse over the plot and checks that the tooltip appears, as new DOM text
     for HTML tooltips or a canvas repaint for Chart.js. All 24 chart bundles pass, for both the esbuild
     and Rollup builds. After-hover screenshots are in `verify/screenshots/dist/`. The legend and axes
     are visible for all nine libraries.
   * **Animation and crosshair:** a trace of every animation frame for the first 4 s after load shows the lines
     growing or morphing in for Unovis, TanStack Charts (`motion()`), Chart.js, Recharts and ECharts, and not for Nivo,
     Observable Plot, Vega-Lite, AG Charts Community or TanStack's `svgAnimation` build. A hover screenshot of every
     bundle shows the crosshair line, except for AG Charts (no crosshair in Community) and TanStack's defaults.
   * **Second bundler** (Rollup, above) and **target sensitivity** (es2022/esnext, above).

### Top 5 contributors per bundle (esbuild metafile, KB of minified output)

| Bundle | Modules | Top 5 packages |
|---|---:|---|
| chartjs-react | 7 | chart.js 151.7, @kurkle/color 7.4, react-chartjs-2 1.4, (entry + shared data) 1.0 |
| unovis-react | 245 | @unovis/ts 76.9, d3-shape 17.1, d3-selection 12.3, d3-transition 10.7, d3-color 7.1 |
| nivo | 376 | lodash 31.3, @react-spring/core 23.0, @nivo/line 21.2, d3-shape 18.5, d3-scale-chromatic 17.6 |
| recharts | 372 | recharts 242.1, d3-scale 14.0, d3-shape 13.5, @reduxjs/toolkit 13.4, es-toolkit 13.1 |
| echarts-react | 267 | echarts 344.2, zrender 175.3, tslib 7.0, echarts-for-react 4.4, size-sensor 3.6 |
| agcharts-react | 5 | ag-charts-community 1115.4, ag-charts-core 203.9, (entry + shared data) 0.7, ag-charts-react 0.7 |
| chartjs | 6 | chart.js 151.7, @kurkle/color 7.4, (entry + shared data) 1.0 |
| unovis-ts | 237 | @unovis/ts 76.9, d3-shape 17.1, d3-selection 12.3, d3-transition 10.7, d3-color 7.1 |
| plot-react | 369 | @observablehq/plot 114.7, d3-geo 24.9, d3-shape 18.1, d3-scale-chromatic 17.7, d3-selection 12.4 |
| tanstack-react | 65 | @tanstack/charts 153.4, d3-shape 4.8, d3-path 2.0, (entry + shared data) 1.1 |
| vegalite-react | 367 | vega-lite 251.9, vega-scenegraph 56.6, vega-parser 46.0, vega-transforms 39.4, vega-embed 36.6 |
| echarts | 241 | echarts 334.3, zrender 171.7, (entry + shared data) 0.7, tslib 0.4 |
| agcharts | 4 | ag-charts-community 1115.4, ag-charts-core 203.9, (entry + shared data) 0.6 |
| tanstack | 63 | @tanstack/charts 151.1, d3-shape 4.8, d3-path 2.0, (entry + shared data) 0.9 |

The full per-package and per-file breakdown for every bundle is in `dist/report.md`.

## Findings worth flagging

1. **AG Charts 14.2.0 doesn't tree-shake as advertised.** Its module-registry docs say that importing
   only the modules you need will "reduce bundle size ... with treeshaking support". Registration is
   mandatory: without it, `AgCharts.create` throws "No modules have been registered". But registering only
   the four modules this chart needs saves just 3.4% compared with `AllCommunityModule`. A file that does
   nothing but `import { ModuleRegistry } from 'ag-charts-community'` already bundles to 1,303.4 KB min /
   391.6 KB gzip. The classes of the unregistered cartesian series (Bar, Area, Histogram, Bubble,
   Scatter) and axes (Log, Time, Grouped-category, Unit-time) are still in the bundle; only the polar
   Pie/Donut code is dropped. Rollup gives the same result, so this is not an esbuild issue. The
   likely cause, not fully traced: the package ships a single flat ESM file whose top level runs
   side-effectful code that keeps internals reachable. For example,
   `__export(module_support_exports, {…})` fills the `_ModuleSupport` namespace with getters for
   internal classes, and core code does `instanceof NumberAxis || instanceof TimeAxis`. A bundler has
   to keep everything those statements reference, whatever is imported or registered.
2. **Chart.js tree-shaking works, but saves only about 20%.** Unregistered controllers and elements such
   as doughnut, polarArea, bubble, arc and decimation are removed. The monolithic core
   (`chart.js/dist/chart.js` 121.1 KB + helpers 30.6 KB) stays.
3. **ECharts tree-shaking works (−54% vs the full import),** but the minimal line chart is still
   508.3 KB min, mostly ECharts core and zrender.
4. **The ECharts React wrapper costs 29.8 KB min / 10.3 KB gzip over vanilla ECharts,** and not only its
   own code. `<ReactEChartsCore echarts={echarts}>` takes the whole `echarts/core` namespace as a prop,
   so no export of it can be dropped (+13.5 KB of ECharts/zrender; confirmed by assigning the namespace
   to `window` in the vanilla build). The README's `echarts-for-react/lib/core` path is CommonJS and pulls
   in all of `tslib` (+6.1 KB min / +1.9 KB gzip compared with the package's own `esm/core` build:
   532.0 / 180.9 KB). echarts-for-react also `require`s `tslib` without declaring it as a dependency. It
   only works because ECharts' own copy gets hoisted.
5. **A plain `npm install @nivo/line @nivo/core` (npm 11.12.1) nests six identical copies of
   `@react-spring/web@10.1.2`.** That makes the Nivo bundle 294,494 B min / 100,751 B gzip (287.6 / 98.4 KB).
   The table uses the deduplicated tree (one copy, as `npm dedupe`, pnpm or yarn would produce), so Nivo
   isn't penalized for an npm hoisting quirk. Nivo also bundles `lodash` (31.3 KB) and all
   d3-scale-chromatic color schemes (17.6 KB), even though explicit colors are passed.
6. **Recharts:** the `responsive` prop (Recharts ≥ 3.3) is free. A fixed `width={800} height={300}`
   build differs by 25 bytes because the resize code ships either way. The older
   `<ResponsiveContainer>` idiom adds 6.7 KB min / 1.7 KB gzip (387,801 / 113,260 B).
8. **Observable Plot doesn't tree-shake by mark.** `Plot.plot` takes its marks as values, so every mark, scale and
   projection stays reachable: a line chart bundles d3-geo (24.9 KB min), d3-scale-chromatic (17.7 KB) and d3-zoom
   along with Plot's own 114.7 KB. The React variant is only 0.3 KB larger than the vanilla one, because Plot has no
   wrapper at all.
9. **Vega-Lite ships a compiler.** Every Vega-Lite spec is compiled to Vega at runtime, so the bundle carries the
   Vega-Lite compiler (251.9 KB min) and the Vega runtime (scenegraph, parser, transforms, expression language, view):
   825.4 KB min for a line chart, the second-largest bundle here. react-vega adds 1.9 KB over vanilla vega-embed.
10. **TanStack Charts' defaults are small because it skips d3 and turns features on by import.** Its default line chart
   (straight lines, no crosshair, no animation) is 52 modules, all its own; its compact scales format numbers with the
   platform instead of d3-scale + d3-format + d3-interpolate + d3-color (TanStack measures that swap at +7.2 KB gzip
   itself). Of the 15.3 KB gzip gap between that and Unovis, measured by stubbing one part at a time: Unovis' animation
   stack (d3-transition, d3-interpolate-path) is 7.2 KB and is bundled even with `duration: 0`; the d3 scale stack about
   5.1 KB; features Unovis picks by config string, so a bundler can't drop them (the `Curve` map with all 18 d3 curves
   1.9 KB, pattern fills about 1.5 KB, tick fitting and the symbol map about 1.4 KB) about 4.8 KB; the CSS runtime and
   its 72 `--vis-*` variables about 4.1 KB. The other way, TanStack carries about 10.3 KB gzip more interaction and
   accessibility code: keyboard focus, hit testing for every mark shape, an `aria-live` tooltip.
11. **With the same behavior, the two are about the same size.** The measured TanStack chart turns on what Unovis does
   by default: a monotone curve (`d3Curve`, which brings d3-shape), `focusGuideX` for the crosshair and its markers, and
   the `motion()` renderer, which animates the first render and data updates as Unovis does: 161.3 / 54.7, 1.9 KB gzip
   over Unovis. `motion.js` is 44.5 KB min of that. Animating only data updates, with the `svgAnimation` tween instead
   of `motion()` (Nivo animates the same way), gives 118.2 / 41.3 (`libs/tanstack/tanstack-react-tween.jsx`); the
   library's defaults give 106.8 / 37.5 (`tanstack-react-defaults.jsx`). Unovis still morphs lines when the number of
   points changes, and wraps or trims tick labels; TanStack still adds keyboard navigation and server-rendered SVG markup.
12. **Measurement artifact, not a library problem:** with React external and ESM output, esbuild leaves
   `require("react")` calls inside CommonJS dependencies. Recharts has them via
   `use-sync-external-store`, and echarts-for-react via `lib/core`. The size is unaffected, but the files
   only run where a `require` exists, so the smoke-test page provides a shim. In a normal app, where
   React is bundled, this doesn't occur. The Rollup builds need no shim.

## Caveats

* This is one chart type with a small, fixed feature set, and not every library can draw all of it (see
  [Method](#method)).
  Libraries with a large shared core (AG Charts, ECharts, Vega-Lite, Chart.js, Observable Plot, TanStack Charts)
  amortize it over more chart types, while Unovis, Recharts and Nivo
  grow per component. Adding a second chart type will change the gaps.
* Canvas libraries (Chart.js, ECharts, AG Charts) and SVG libraries (Unovis, Recharts, Nivo, Observable Plot,
  Vega-Lite by default) differ in
  more than size. This page only measures bytes.
* Only download size is measured. Parse/execute time and runtime memory are not.
* The React rows exclude React, and the React versions are measured with React 18.3.1 installed.

## Raw numbers

| id | min (bytes) | gzip (bytes) | brotli (bytes) |
|---|---:|---:|---:|
| unovis-react | 167,885 | 54,068 | 47,813 |
| recharts | 380,941 | 111,528 | 93,586 |
| chartjs-react | 166,027 | 58,188 | 51,055 |
| echarts-react | 551,017 | 187,205 | 159,659 |
| agcharts-react | 1,352,521 | 406,495 | 326,057 |
| nivo | 277,024 | 95,882 | 82,042 |
| plot-react | 268,741 | 90,929 | 78,318 |
| vegalite-react | 845,188 | 291,332 | 248,810 |
| tanstack-react | 165,159 | 56,007 | 48,908 |
| unovis-ts | 163,325 | 53,419 | 46,868 |
| chartjs | 164,545 | 57,590 | 50,485 |
| echarts | 520,547 | 176,644 | 150,811 |
| agcharts | 1,351,750 | 406,105 | 325,618 |
| plot | 268,480 | 90,776 | 78,279 |
| vegalite | 843,268 | 290,600 | 248,169 |
| tanstack | 162,630 | 55,232 | 48,151 |
| chartjs-auto (reference) | 205,913 | 70,975 | 61,468 |
| echarts-full (reference) | 1,134,425 | 379,679 | 309,673 |
| agcharts-all (reference) | 1,398,974 | 419,854 | 336,219 |
| echarts-react-esm (reference) | 544,792 | 185,267 | 157,883 |
| unovis-react-npm (reference) | 211,455 | 68,746 | 60,543 |
| unovis-ts-npm (reference) | 206,382 | 67,824 | 59,345 |
| tanstack-react-tween (reference) | 121,007 | 42,328 | 37,379 |
| tanstack-react-defaults (reference) | 109,326 | 38,440 | 34,175 |
| react-baseline (context) | 143,321 | 45,918 | 40,064 |
| agcharts-registry-only (context) | 1,334,700 | 401,010 | 321,596 |

## Reproduce

Requirements: Node ≥ 22 (measured with 24.11.1) and npm (11.12.1). The smoke test also needs Google
Chrome (set `CHROME=/path/to/chrome` if it isn't at the default macOS location).

```sh
pnpm build:ts && pnpm build:react              # at the repository root: the Unovis rows measure packages/{ts,react}/dist
./measure.sh                                   # npm ci in libs/*, pack + install the Unovis build, write dist/report.md + dist/sizes.json
node verify/verify.mjs                         # optional: headless-Chrome smoke test + screenshots
(cd crosscheck && npm ci && node rollup.mjs)   # optional: Rollup cross-check -> dist-rollup/report.md
TARGET=es2022 OUT=dist-es2022 ./measure.sh     # optional: target sensitivity
```

The builds are deterministic: re-running `measure.sh` reproduced every byte count above.

### Files

* `measure.sh`: installs, builds (the exact esbuild flags) and runs the analysis
* `analyze.mjs`: size measurement, metafile analysis and the isolation guard → `dist/report.md`, `dist/sizes.json`
* `libs/shared/data.js`: shared data and series definitions
* `libs/<library>/`: the pinned `package.json` + `package-lock.json` and entry files for each library
  * `unovis/unovis-react.jsx`, `unovis/unovis-ts.js` (the published package, reference rows); `unovis-local/` gets the
    repository build (only its `package.json` is committed, the tarballs and entry copies are written by `measure.sh`)
  * `recharts/recharts.jsx`
  * `chartjs/chartjs-react.jsx`, `chartjs/chartjs.js`, `chartjs/chartjs-auto.js` (reference) and the shared
    `chartjs/crosshair-plugin.js`
  * `echarts/echarts-react.jsx`, `echarts/echarts.js`, `echarts/echarts-full.js` and `echarts/echarts-react-esm-core.jsx` (reference)
  * `agcharts/agcharts-react.jsx`, `agcharts/agcharts.js`, `agcharts/agcharts-all.js` (reference), `agcharts/agcharts-registry-only.js` (context)
  * `nivo/nivo.jsx`
  * `plot/plot-react.jsx`, `plot/plot.js`
  * `vegalite/vegalite-react.jsx`, `vegalite/vegalite.js` and the shared `vegalite/vegalite-spec.js`
  * `tanstack/tanstack-react.jsx`, `tanstack/tanstack.js` and the shared `tanstack/tanstack-definition.js`;
    `tanstack/tanstack-react-tween.jsx` (reference: the same definition with `svgAnimation` instead of `motion()`) and
    `tanstack/tanstack-react-defaults.jsx` with `tanstack-defaults-definition.js` (reference: the library's defaults)
  * `react/react-baseline.jsx` (context)
* `verify/`: the smoke test (`verify.mjs`, `index.html`, `build-vendor.mjs`), `results-*.json` and screenshots
* `crosscheck/`: the Rollup cross-check (`rollup.mjs` + pinned `package.json`)

## Notes for the Unovis team (not part of the comparison)

The September run found three things in `@unovis/ts` 1.7.0 / `@unovis/react` 1.7.0; the repository build above has two
of them fixed:

* Fixed in #938: `@unovis/react/index.js` injected the `VisTimeSeries` CSS in every bundle (511 unused bytes and an
  unused `<style>` element), and `utils/resize-observer.js` always bundled the `@juggle/resize-observer` polyfill
  (8.3 KB min). The same PR imports d3 scales directly instead of through the `Scale` object, which had kept all 16
  scales and all of d3-time / d3-time-format in every XY chart (−7.6 KB gzip).
* Fixed in #937: Emotion and its vendor prefixer (15.7 KB min) are replaced by a built-in CSS runtime on stylis (4.0 KB).
* In review (#936): `Crosshair` logs "Y accessors have not been configured" on the first render, even though the
  accessors come from the container and the crosshair works. The smoke test still prints the warning for the
  repository build until that PR merges.

Measured opportunities from the TanStack comparison (React line chart, stubbed or rebuilt one at a time):

| Change | Saves (min / gzip) | Notes |
|---|---:|---|
| Make animation a pluggable import, so `duration: 0` apps don't ship d3-transition and d3-interpolate-path | 21,640 / 7,363 | path morph alone 6,028 / 2,292 |
| Let `curveType` take a d3 curve; keep the string map behind its own import | 12,607 / 1,973 | renders identically |
| Compile the CSS at build time instead of shipping stylis | 5,391 / 2,395 | the CSS text stays |
| Inject the pattern `<defs>` only when patterns are used | 1,099 / 331 | about 1.5 KB gzip with the pattern CSS |
| A compact linear scale for numeric axes | about 5–7 KB gzip | estimate; time scales still need d3; d3-format's output is discarded today (axis labels are set by `tickFormat` or `String`) |
