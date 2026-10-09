# Bundle size of an equivalent line chart in six JavaScript charting libraries

Measured 2026-09-22; the Unovis rows were re-measured on 2026-10-09 from the repository build (the stack
`main` + [#938](https://github.com/f5/unovis/pull/938) + [#937](https://github.com/f5/unovis/pull/937), commit
`f0820fce`), with the published 1.7.1 kept as reference rows. The other libraries are unchanged and reproduced
byte for byte. Every number here is reproduced by `./measure.sh` (see [Reproduce](#reproduce)).

**The chart:** 3 line series × 24 points, an x and a y axis (with grid lines), a hover tooltip that lists
all three series at the hovered x, and a legend. Every library gets the same data module, the same three
series colors, the full container width and a height of 300 px. Each one is written with that library's
own idiomatic imports, tree-shaken where the library supports it.

**Sizes:** production bundle built with esbuild. **min** = minified bytes, **gzip** = `gzip -9`,
**brotli** = brotli quality 11. **1 KB = 1,024 bytes.** Each table is sorted by gzip size. Exact byte
counts are in [Raw numbers](#raw-numbers).

## React (React and ReactDOM excluded)

| # | Library | Imports used | min (KB) | gzip (KB) | brotli (KB) | Notes |
|---:|---|---|---:|---:|---:|---|
| 1 | Unovis, repository build (`@unovis/react`) | `VisXYContainer, VisLine, VisAxis, VisCrosshair, VisTooltip, VisBulletLegend` | 164.0 | 52.8 | 46.7 | SVG. Only the 6 used components are bundled (76.9 KB); the rest is d3 modules (77.1 KB), the React wrapper (4.4 KB) and the built-in CSS runtime's stylis (4.0 KB). The published 1.7.1 is 206.5 / 67.1 / 59.1 (reference rows below): #938 removed the `Scale` object and the `ResizeObserver` polyfill, #937 replaced Emotion. |
| 2 | Chart.js 4.5.1 + react-chartjs-2 5.3.1 | `Line` from react-chartjs-2; `Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)` | 161.8 | 56.7 | 49.7 | Canvas. `<Line>` registers `LineController` itself. The chart.js core accounts for 151.7 KB. |
| 3 | Nivo 0.99.0 (`@nivo/line`) | `ResponsiveLine` | 270.5 | 93.6 | 80.2 | SVG. Includes react-spring (45.0 KB), lodash (31.3 KB) and d3-scale-chromatic (17.6 KB). A plain `npm install` bundles 287.6 / 98.4 KB instead (see finding 5). |
| 4 | Recharts 3.10.1 | `LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend` | 372.0 | 108.9 | 91.4 | SVG. Recharts' own code is 242.1 KB; it also pulls in Redux Toolkit, Immer, reselect and react-redux (32.9 KB), plus es-toolkit and decimal.js-light. The `react-is` peer dependency is bundled (2.0 KB). |
| 5 | ECharts 6.1.0 + echarts-for-react 3.0.6 | `echarts-for-react/lib/core` + `echarts/core` with `echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])` | 538.1 | 182.8 | 155.9 | Canvas. ECharts' documented tree-shaking approach. The wrapper adds 29.8 KB over the vanilla build (finding 4). |
| 6 | AG Charts Community 14.2.0 + ag-charts-react 14.2.0 | `AgCharts` + `ModuleRegistry.registerModules([LineSeriesModule, CategoryAxisModule, NumberAxisModule, LegendModule])` | 1,320.8 | 397.0 | 318.4 | Canvas. Registering modules is required in v14, but it barely reduces the bundle size (finding 1). |

For context, React 18.3.1 + ReactDOM (`react`, `react-dom/client`, `react/jsx-runtime`) come to
**140.0 KB min / 44.8 KB gzip / 39.1 KB brotli**. Add that to any row for an app that doesn't already ship React.

## Vanilla JavaScript (no framework)

| # | Library | Imports used | min (KB) | gzip (KB) | brotli (KB) | Notes |
|---:|---|---|---:|---:|---:|---|
| 1 | Unovis, repository build (`@unovis/ts`) | `XYContainer, Line, Axis, Crosshair, Tooltip, BulletLegend` from `@unovis/ts` | 159.5 | 52.2 | 45.8 | SVG. The root-barrel import tree-shakes to the same `@unovis/ts` code as the React wrapper's deep imports (76.9 KB in both). The published 1.7.1 is 201.5 / 66.2 / 58.0. |
| 2 | Chart.js 4.5.1 | `Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)` | 160.4 | 56.1 | 49.2 | Canvas. |
| 3 | ECharts 6.1.0 | `echarts/core` + `echarts.use([...])` as above, `echarts.init` | 508.3 | 172.5 | 147.3 | Canvas. |
| 4 | AG Charts Community 14.2.0 | `AgCharts.create` + the same 4 modules | 1,320.0 | 396.6 | 318.0 | Canvas. |

Recharts and Nivo are React-only.

**CSS:** none of the libraries needs a separate stylesheet. esbuild emitted no `.css` file for any entry.
Unovis (its built-in CSS runtime), AG Charts and Nivo (through react-virtualized-auto-sizer) inject their styles from
JavaScript at runtime, so that CSS is already counted above. Recharts, ECharts and Chart.js use inline
styles or canvas.

## Tree-shaking check (same chart, non-tree-shaken entry points)

| Library | Tree-shaken (min / gzip KB) | Convenience import (min / gzip KB) | Saving (min / gzip) |
|---|---:|---:|---:|
| Chart.js | 160.4 / 56.1 | `chart.js/auto`: 200.8 / 69.2 | −20.1% / −18.9% |
| ECharts | 508.3 / 172.5 | full `echarts`: 1,107.8 / 370.8 | −54.1% / −53.5% |
| AG Charts | 1,320.0 / 396.6 | `AllCommunityModule`: 1,366.2 / 410.0 | **−3.4% / −3.3%** |
| AG Charts | – | `import { ModuleRegistry }` alone, no modules, no chart: **1,303.4 / 391.6** | – |
| Unovis | 159.5 / 52.2 | – (the metafile shows only the 6 used components; no maps, graph or other components) | – |

## Cross-check with a second bundler (Rollup)

To make sure no result is an esbuild quirk, the same entry files were also bundled with Rollup 4.63.4
(`@rollup/plugin-node-resolve` + `@rollup/plugin-commonjs`, default tree-shaking, same externals) and
then minified with the same esbuild minifier and target (`crosscheck/rollup.mjs`).

| Variant | esbuild min / gzip (KB) | Rollup min / gzip (KB) |
|---|---:|---:|
| Chart.js + react-chartjs-2 | 161.8 / 56.7 | 153.1 / 53.6 |
| Unovis (React, repository build) | 164.0 / 52.8 | 161.9 / 51.7 |
| Nivo | 270.5 / 93.6 | 265.1 / 91.9 |
| Recharts | 372.0 / 108.9 | 360.7 / 106.0 |
| ECharts + echarts-for-react | 538.1 / 182.8 | 531.5 / 180.2 |
| AG Charts + ag-charts-react | 1,320.8 / 397.0 | 1,327.5 / 397.8 |
| Chart.js (vanilla) | 160.4 / 56.1 | 151.7 / 53.0 |
| Unovis (vanilla, repository build) | 159.5 / 52.2 | 157.9 / 51.2 |
| ECharts (vanilla) | 508.3 / 172.5 | 502.6 / 170.1 |
| AG Charts (vanilla) | 1,320.0 / 396.6 | 1,326.7 / 397.4 |
| AG Charts, `AllCommunityModule` | 1,366.2 / 410.0 | 1,376.5 / 411.7 |
| AG Charts, `import { ModuleRegistry }` only | 1,303.4 / 391.6 | 1,307.8 / 391.7 |
| Unovis 1.7.1 as published (React) | 206.5 / 67.1 | 203.3 / 65.5 |
| Unovis 1.7.1 as published (vanilla) | 201.5 / 66.2 | 198.9 / 64.8 |

The ranking is identical under both bundlers. For the ten compared variants, Rollup's output is 1.0–3.0%
smaller for Unovis, Nivo, Recharts and ECharts, 5.4% smaller for Chart.js (min and gzip), and 0.5%
larger for AG Charts. Under Rollup, Unovis stays 1.9 KB gzip under Chart.js (React) and 1.8 KB (vanilla),
while Chart.js is 8.8 KB smaller minified. The `chart.js/auto` reference build is 1.2% larger.
Changing the esbuild target to `es2022` or `esnext` moves gzip sizes by 0.4% at most (`dist-es2022/`,
`dist-esnext/`), so the `es2020` target doesn't favor any library.

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
   spends on the longer file name.
2. **One entry file per library and variant** (`libs/<library>/*.js(x)`). Each renders the chart into
   `#app` with `createRoot(...).render(...)`, `new XYContainer(...)`, `echarts.init(...)`, `new Chart(...)`
   or `AgCharts.create(...)`, so nothing can be dead-code-eliminated. Data, series names and colors come from
   `libs/shared/data.js` in every bundle (0.3 KB). Colors are passed explicitly everywhere because
   tree-shaken Chart.js has no default palette and Recharts draws every `<Line>` in the same default
   color. Tooltips use each library's shared/axis mode: Unovis Crosshair + Tooltip, Recharts `<Tooltip>`,
   Chart.js `interaction: { mode: 'index', intersect: false }`, ECharts `trigger: 'axis'`, AG Charts
   `tooltip.mode: 'shared'`, Nivo `enableSlices="x"`.
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
     for HTML tooltips or a canvas repaint for Chart.js. All 16 chart bundles pass, for both the esbuild
     and Rollup builds. After-hover screenshots are in `verify/screenshots/dist/`. The legend and axes
     are visible for all six libraries.
   * **Second bundler** (Rollup, above) and **target sensitivity** (es2022/esnext, above).

### Top 5 contributors per bundle (esbuild metafile, KB of minified output)

| Bundle | Modules | Top 5 packages |
|---|---:|---|
| chartjs-react | 6 | chart.js 151.7, @kurkle/color 7.4, react-chartjs-2 1.4, (entry + shared data) 0.7 |
| unovis-react | 245 | @unovis/ts 76.9, d3-shape 17.1, d3-selection 12.3, d3-transition 10.7, d3-color 7.1 |
| nivo | 376 | lodash 31.3, @react-spring/core 23.0, @nivo/line 21.2, d3-shape 18.5, d3-scale-chromatic 17.6 |
| recharts | 372 | recharts 242.1, d3-scale 14.0, d3-shape 13.5, @reduxjs/toolkit 13.4, es-toolkit 13.1 |
| echarts-react | 267 | echarts 344.2, zrender 175.3, tslib 7.0, echarts-for-react 4.4, size-sensor 3.6 |
| agcharts-react | 5 | ag-charts-community 1115.4, ag-charts-core 203.9, (entry + shared data) 0.7, ag-charts-react 0.7 |
| chartjs | 5 | chart.js 151.7, @kurkle/color 7.4, (entry + shared data) 0.7 |
| unovis-ts | 237 | @unovis/ts 76.9, d3-shape 17.1, d3-selection 12.3, d3-transition 10.7, d3-color 7.1 |
| echarts | 241 | echarts 334.3, zrender 171.7, (entry + shared data) 0.7, tslib 0.4 |
| agcharts | 4 | ag-charts-community 1115.4, ag-charts-core 203.9, (entry + shared data) 0.6 |

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
7. **Measurement artifact, not a library problem:** with React external and ESM output, esbuild leaves
   `require("react")` calls inside CommonJS dependencies. Recharts has them via
   `use-sync-external-store`, and echarts-for-react via `lib/core`. The size is unaffected, but the files
   only run where a `require` exists, so the smoke-test page provides a shim. In a normal app, where
   React is bundled, this doesn't occur. The Rollup builds need no shim.

## Caveats

* This is one chart type with a small, fixed feature set. Libraries with a large shared core (AG Charts,
  ECharts, Chart.js) amortize it over more chart types, while Unovis, Recharts and Nivo grow per
  component. Adding a second chart type will change the gaps.
* Canvas libraries (Chart.js, ECharts, AG Charts) and SVG libraries (Unovis, Recharts, Nivo) differ in
  more than size. This page only measures bytes.
* Only download size is measured. Parse/execute time and runtime memory are not.
* The React rows exclude React, and the React versions are measured with React 18.3.1 installed.

## Raw numbers

| id | min (bytes) | gzip (bytes) | brotli (bytes) |
|---|---:|---:|---:|
| unovis-react | 167,885 | 54,068 | 47,813 |
| recharts | 380,925 | 111,517 | 93,556 |
| chartjs-react | 165,710 | 58,070 | 50,934 |
| echarts-react | 551,007 | 187,200 | 159,646 |
| agcharts-react | 1,352,491 | 406,488 | 326,051 |
| nivo | 277,006 | 95,882 | 82,099 |
| unovis-ts | 163,325 | 53,419 | 46,868 |
| chartjs | 164,228 | 57,463 | 50,334 |
| echarts | 520,537 | 176,639 | 150,877 |
| agcharts | 1,351,720 | 406,099 | 325,636 |
| chartjs-auto (reference) | 205,596 | 70,844 | 61,447 |
| echarts-full (reference) | 1,134,415 | 379,671 | 309,703 |
| agcharts-all (reference) | 1,398,944 | 419,843 | 336,100 |
| echarts-react-esm (reference) | 544,782 | 185,262 | 157,807 |
| react-baseline (context) | 143,321 | 45,918 | 40,064 |
| agcharts-registry-only (context) | 1,334,700 | 401,010 | 321,596 |
| unovis-react-npm (reference) | 211,455 | 68,746 | 60,543 |
| unovis-ts-npm (reference) | 206,382 | 67,824 | 59,345 |

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
  * `chartjs/chartjs-react.jsx`, `chartjs/chartjs.js`, `chartjs/chartjs-auto.js` (reference)
  * `echarts/echarts-react.jsx`, `echarts/echarts.js`, `echarts/echarts-full.js` and `echarts/echarts-react-esm-core.jsx` (reference)
  * `agcharts/agcharts-react.jsx`, `agcharts/agcharts.js`, `agcharts/agcharts-all.js` (reference), `agcharts/agcharts-registry-only.js` (context)
  * `nivo/nivo.jsx`
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
