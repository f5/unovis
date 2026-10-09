---
name: library-comparisons
description: >-
  Maintain the "Why Unovis" website section (packages/website/why-unovis): live side-by-side comparisons that render
  the same data with Unovis and other charting libraries, the feature comparison matrix, and the bundle-size
  numbers. Use when asked to add or update a comparison page, add a library to the comparisons, refresh versions,
  feature research, npm download numbers or bundle sizes, or fix a comparison demo.
---

# Library comparisons ("Why Unovis")

The **Why Unovis** section of the website (`/why-unovis`, a top-level navbar item) shows what sets Unovis apart and
backs it up with evidence: every side-by-side page renders the **same data** with Unovis and each competing library
that can draw the chart, live and interactive, with the exact code for each one. The public rules for these pages are
on `/why-unovis/methodology` (`packages/website/why-unovis/methodology.mdx`). **Read that page first; this skill is the
engineering side of it.** Keep both in sync when you change how comparisons work.

## Where things live

```
packages/website/
├── why-unovis/                       # MDX pages; a separate docs plugin instance with id "why-unovis"
│   ├── index.mdx                     # overview: strengths, links to every page, at-a-glance table, bundle sizes, caveats
│   ├── line-chart.mdx … tile-map.mdx # one side-by-side page per chart type (11 today)
│   ├── feature-comparison.mdx        # the full feature matrix
│   ├── methodology.mdx               # library selection, the rules, feature research, bundle sizes, versions
│   └── styles.css                    # global `why-unovis-*` classes for the overview card grids
├── sidebars-why-unovis.js            # sidebar of the section
├── docusaurus.config.js              # navbar item, docs plugin instance, MapLibre alias and worker rule, docgen exclusion
├── src/comparisons/                  # data, demos and research (excluded from react-docgen, see Gotchas)
│   ├── types.ts                      # LibraryId, Comparison, ComparisonImplementation, UnsupportedImplementation
│   ├── libraries.ts                  # name, versions (read from package.json), license, renderer, website
│   ├── constants.ts                  # chart area heights, initial random seed
│   ├── build-sizes.ts                # measured bundle sizes shown on the overview and methodology pages
│   ├── utils/random.ts               # seeded random generator, so every library gets identical data
│   ├── utils/code.ts                 # strips lint directives from the code shown on the page
│   ├── features/                     # feature matrix: groups.ts (rows) + one file per library (cells)
│   └── <comparison>/                 # line, area, grouped-bar, stacked-bar, scatter, donut, circular-bar, graph, sankey, choropleth, tile-map
│       ├── data.ts                   # types, formatters and getData(seed)
│       ├── <library>.tsx             # one demo per library: unovis, recharts, chartjs, echarts, nivo, ag-charts, …
│       └── index.ts                  # the Comparison registry for the page
├── src/components/
│   ├── LibraryComparison/            # the side-by-side grid: toolbar, chart cards, placeholder cards, lazy loading, code view
│   ├── FeatureTable/                 # feature tables and the status legend
│   └── BuildSizeChart/               # bundle-size bar chart (drawn with Unovis)
├── src/utils/maplibre-gl.ts          # every `maplibre-gl` import on the site resolves here; sets MapLibre's worker URL
└── scripts/why-unovis-build-sizes/   # reproducible bundle-size measurement (see "Bundle sizes")
```

## Run and check it

1. `pnpm install` at the repo root. The website aliases `@unovis/ts` to `packages/ts/dist`, so run `pnpm build:ts`
   after changing core code.
2. `pnpm website`, then open <http://localhost:9300/why-unovis>. Changes to `docusaurus.config.js` or
   `sidebars-why-unovis.js` need a restart.
3. Lint what you touched from the repo root, with the flags `pnpm lint` uses:
   `npx eslint --ext .js,.jsx,.ts,.tsx --ignore-path .gitignore packages/website/src/comparisons packages/website/why-unovis`.
   The harness' `.mjs` scripts are outside the repo's lint scope.
4. Production check before you finish: `cd packages/website && pnpm build`. It catches SSR errors (a demo importing
   something that touches `window` at module level) and broken links (`onBrokenLinks: 'throw'`). Stop the dev server
   first; both write to `.docusaurus`. Then check that `build/assets/js/main.*.js`, which every page loads, didn't grow:
   chart and map libraries belong in the demos' lazy chunks.
5. Look at every page you changed, in light and dark mode, at desktop and phone width. Hover the charts, click the
   legends, press the update button, open **Code** and **Show the data**. See "Visual checks" for doing this headlessly.

## How a comparison works

- `Comparison<Data>` (`src/comparisons/types.ts`): `id`, `getData(seed)`, `dataCode` (the raw `data.ts`, shown by
  **Show the data**), optional `updateLabel` for the update button, optional `chartHeight`, optional `wide`,
  `implementations`, and `unsupported`.
- Every library in the comparison gets a card on every page. A library that can't draw the chart goes in `unsupported`
  with a full-sentence `reason` and a source `url`, and gets a placeholder card after the charts. Set `paid: true` when
  the chart exists only in a paid edition (AG Charts Enterprise): the card then says "Only in the paid edition".
- `LibraryComparison` keeps a seed that starts at `COMPARISON_INITIAL_SEED`. The update button increments it, and every
  card gets the same `data` object from `getData(seed)`. `isDark` comes from Docusaurus' `useColorMode()`.
- Each implementation is `{ library, load: () => import('./<library>'), code: require('!!raw-loader!./<library>.tsx').default }`.
  `load` makes every demo a lazy chunk that only loads on its page; `code` is the file's own source, shown by **Code**
  (lint directives are stripped by `stripLintDirectives`). An optional `renderer` overrides the card's renderer badge.
- `ChartCard` renders the demo inside `BrowserOnly`, `Suspense` and an error boundary, in a chart area of fixed height:
  `COMPARISON_CHART_HEIGHT` (320px), `COMPARISON_TALL_CHART_HEIGHT` (440px) for flows and maps, or
  `COMPARISON_GRAPH_CHART_HEIGHT` (560px) for the network graph. `wide: true` makes every chart card span the full
  grid, for charts whose labels get too small at half width (the network graph); placeholders then sit two to a row.

### The demo contract

Every `<library>.tsx` has a **default export** that takes `{ data, isDark }` and fills the chart area:

- React components from other libraries get `height: '100%'` (or their own responsive mode: `responsive` for Recharts,
  `Responsive*` components for Nivo, `maintainAspectRatio: false` for Chart.js).
- Unovis demos put a `VisBulletLegend` (about 24px) above the container, so the container height is the chart area
  height minus 24: `height={296}` for 320, `height={416}` for 440, `height={536}` for 560. A `SingleContainer` without
  a legend uses the full height.
- Unovis ignores `isDark`: its dark theme comes from CSS. Don't add dark-mode code to Unovis demos.

## Fairness rules for demo code

These are the rules on the methodology page, as instructions:

1. **Same data, same chart.** Same series, encodings, axes, legend and tooltip content in every library.
2. **Idiomatic and complete.** Use each library's documented React integration and its documented way to do things.
   The code on the page is the code that runs: no hidden helpers beyond `data.ts` and a comparison's `constants.ts`.
3. **Default look.** Keep each library's default colors, fonts, spacing and interactions, for Unovis too. When a
   library has no default palette for a chart, take the colors from its own docs or examples and say so in a comment
   (Recharts: `#8884d8, #82ca9d, #ffc658, #ff7300` from its docs, and its pie example's colors for the donut; Chart.js
   plugins: the Colors plugin palette; Nivo network: the `nivo` scheme). Exception: color scales that encode values
   are shared, so the maps can be compared: every choropleth uses d3's Blues (`choropleth/constants.ts`), the Chart.js
   geo plugin's default, and every library shows a color legend (Unovis: a `RollingPinLegend` above the map).
4. **Only what the chart needs.** Turn off point markers, format values, enable shared tooltips where a library has
   them, and that's it. No tuning of looks for any library.
5. **Legend toggles** come built in where available. Otherwise add the few lines of state: Unovis uses
   `BulletLegend` `onLegendItemClick` plus `inactive` items, Recharts uses `Legend` `onClick` plus `hide`.
6. **Dark mode** uses each library's documented approach: ECharts `theme="dark"` plus `backgroundColor: 'transparent'`;
   AG Charts `ag-default-dark` plus `background: { visible: false }`; Chart.js, Recharts and Nivo get colors from
   `isDark`; Unovis maps switch styles with `styleDarkTheme`.
7. **Licenses.** Only render libraries F5 may use commercially and in a competing product. Free editions only
   (AG Charts Community). Not rendered today: Highcharts (commercial), ApexCharts (the free license excludes companies
   above $2M revenue and competing charting products), react-leaflet (Hippocratic License, not OSI-approved). Check the
   license of every new package: `curl -s https://registry.npmjs.org/<pkg>/latest | jq .license`, then read the file.
8. **Plugins** only when a library can't draw the chart without one, and then the most popular one (Chart.js uses
   `chartjs-chart-graph` and `chartjs-chart-sankey`).
9. **Comments** only where they point at something a reader should notice about the library, like
   `// Recharts doesn't have a default color palette`.
10. **"What to look for" bullets** only state what you checked in the browser or in the library's source and docs.
    Credit competitors where they do better, and phrase Unovis' strengths as observable facts.

## Add a comparison page

1. **Data**: create `src/comparisons/<id>/data.ts` with exported types, formatters and `getData(seed)`. Use
   `randomGenerator(seed)` from `utils/random.ts` so data is deterministic. Real datasets go in their own module with a
   source and license comment (see `scatter/penguins.ts`, CC0, and `tile-map/earthquakes.ts`, U.S. public domain).
   Maps use the world TopoJSON that ships with Unovis (`@unovis/ts/maps`); `choropleth/data.ts` also turns it into
   GeoJSON features with topojson-client for the libraries that need GeoJSON, so every library draws the same shapes.
2. **Demos**: one file per library, `unovis.tsx` first, following the contract and the rules above. Copy the closest
   existing comparison.
3. **Registry**: `src/comparisons/<id>/index.ts`, copied from an existing one (it starts with the
   `eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires` header
   the raw-loader requires need). Put Unovis first. List every library that can't draw the chart in `unsupported`, with
   the reason and source URL of its `features/<library>.ts` cell for that chart type; the two must agree.
4. **Page**: `why-unovis/<slug>.mdx`, copied from an existing page: frontmatter with `title`, `description` and
   `hide_table_of_contents: true`, an intro that describes the data, `<LibraryComparison comparison={…}/>`,
   "What to look for", and a `<FeatureTable features={[…]}/>` with the rows that matter for the chart. Only use rows
   whose cells answer the question for this chart type: `zoom-pan` is about XY charts, `graph-zoom` about graphs and
   `map-zoom` about maps. A row researched for one chart type shows wrong notes and links on another page.
5. **Navigation**: add the page to `sidebars-why-unovis.js` and a card to the "Compare side by side" grid in
   `why-unovis/index.mdx`.
6. **Check** everything from "Run and check it", including the update button (Unovis should animate) and legend
   toggles in every library.

## Add a library

1. Check its license (rule 7) and pick its React integration.
2. `pnpm --filter @unovis/website add --save-exact <package>@<version>`. If `@unovis/ts` depends on the same package
   (`maplibre-gl`), use the same version so the site ships one copy.
3. Add its id to `LibraryId` in `types.ts` and its metadata to `libraries.ts` (read the version from `package.json`).
4. For a column in the feature tables: research every row (next section), add `features/<library>.ts`, register it in
   `features/index.ts`, and add the id to `FEATURE_TABLE_LIBRARIES` in `src/components/FeatureTable/constants.ts`.
5. Update `methodology.mdx`: the "Which libraries" table (weekly downloads from
   `https://api.npmjs.org/downloads/point/last-week/<package>`) and the rules if anything new applies.

## Feature research

Rows live in `features/groups.ts`; cells in `features/<library>.ts`. Every cell is
`{ status, note, url }` (`value` too for text-only rows such as rendering). Statuses:

| status | meaning |
| --- | --- |
| `yes` | built into the library |
| `partial` | built in with real limits, which the note names |
| `plugin-official` | an add-on from the library's maintainers (for Chart.js: repositories in the `chartjs` GitHub org) |
| `plugin-community` | a maintained third-party add-on |
| `enterprise` | paid edition only (AG Charts Enterprise) |
| `custom` | possible with your own code on top of the library |
| `no` | not supported |

- Research **the version in `packages/website/package.json`**, not the latest docs: read the type definitions in
  `packages/website/node_modules/<package>`, the source at the release tag, and the docs. Docs sites can document an
  unreleased version: in September 2026, Recharts' site documented its 3.11 canary while 3.10.1 was the release.
- AG Charts: check Community vs Enterprise for every row. The docs show an Enterprise badge, and the Community bundle
  (`ag-charts-community/dist/package/main.esm.mjs`) lists every paid module with `enterprise: true`.
- Notes are at most about 20 words and concrete, with option and component names in backticks. The `url` is the most
  specific page there is: a docs section anchor, an API or option page, or a source file at the tag, never a homepage
  or an unrelated component's docs. For Unovis cells, link the docs section that shows the claim
  (`/docs/components/Graph#pan--zoom--drag`) or a gallery example; leave `url` out for `no` cells rather than linking
  a generic page. Check every note against the row's label: a cell must answer that row, for that library.
- To research many rows, run one agent per library in parallel. Give each the row ids and meanings from `groups.ts`,
  the status table above and the local package path, and ask for JSON `{ "<rowId>": { status, note, url } }` with
  "UNVERIFIED" at the start of any note it couldn't confirm. Then spot-check the surprising cells yourself and
  copy-edit the notes before converting them into `features/<library>.ts`.
- The Unovis column (`features/unovis.ts`) comes from `packages/ts/src` configs and docs. Link docs pages
  (`/docs/components/<Name>`) or gallery examples through the `gallery(title)` helper at the top of that file.

## Bundle sizes

The overview and methodology pages show the minified and gzipped size of the same three-series line chart (axes,
tooltip, legend) in every library, React excluded. The harness lives in `packages/website/scripts/why-unovis-build-sizes`:

- `bash measure.sh` runs `npm ci` in every `libs/<library>/` that has no `node_modules` yet. Each library is its own
  npm project with exact versions and a lockfile, so libraries can't change each other's dependency tree. The Unovis rows
  measure the build from this repository: the script packs `packages/ts/dist` and `packages/react/dist` (run
  `pnpm build:ts && pnpm build:react` first) into `libs/unovis-local/` and installs them there with npm, like an app
  would; `libs/unovis/` holds the published package, measured as a reference row. It then bundles each entry with esbuild
  (`--bundle --minify --format=esm --platform=browser --target=es2020`, production mode, React external) and writes
  `dist/report.md` and `dist/sizes.json`.
- `node verify/verify.mjs` loads every bundle in headless Chrome, checks that the chart draws and its tooltip opens, and
  saves screenshots to `verify/screenshots/`. `cd crosscheck && npm ci && node rollup.mjs` repeats the builds with
  Rollup.
- `RESULTS.md` records the last full run, its findings and the commands.

To refresh:

1. Bump the versions in `libs/<library>/package.json` and run `npm install` there to update the lockfile. For Nivo, run
   `npm dedupe` too; otherwise npm nests a second copy of a dependency and the bundle grows (RESULTS.md, finding 5).
2. Update the version labels in the `build` lines of `measure.sh` (plain text; the Unovis labels come from the packages).
3. Run `bash measure.sh` and `node verify/verify.mjs`; every bundle must still render. `cd crosscheck && node rollup.mjs`
   refreshes the Rollup table.
4. Copy the React rows into `src/comparisons/build-sizes.ts` (in ascending gzip order), update `RESULTS.md`, and update
   the text on `index.mdx` and `methodology.mdx` if the ranking or React's own size changed.
5. After a core change, re-run the same steps: the Unovis rows are the repository build, so they move with `packages/ts`.
   `pnpm size` in `packages/ts` is the quick check (core only, eight charts, no React).

## Refresh everything

When the libraries release new versions:

1. Bump the pinned versions in `packages/website/package.json`; `pnpm install`.
2. Open every page and check every demo still works; fix API changes.
3. Re-research the feature rows the changelogs touch, and anything with an `enterprise`, `plugin-*` or `custom` status.
4. Update the npm downloads and their date on `methodology.mdx`, the bundle sizes, and the "Last updated" line.

## Visual checks

- The Browser pane works while it's visible. When it's hidden (`document.visibilityState === 'hidden'`), screenshots are
  blank and `requestAnimationFrame` never runs, so charts that draw in animation frames (ECharts doesn't even create
  its canvas) and maps stay empty. DOM inspection still works.
- Headless Chrome screenshots: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new
  --hide-scrollbars --window-size=1600,2000 --virtual-time-budget=20000 --screenshot=out.png <url>`. Run it in the
  background and stop it once the file exists; the dev server's websocket keeps Chrome running. Add
  `?docusaurus-theme=dark` to the URL for dark mode. Under virtual time, Recharts and ECharts entry animations often
  don't finish, and maps never load their vector tiles. Both render fine in real time. Don't pass `--disable-gpu`: it
  removes WebGL.
- For maps, hover and clicks, drive Chrome in real time with `puppeteer-core` installed in your scratchpad (not the
  repo). SwiftShader provides the WebGL2 that MapLibre needs:

  ```js
  // node card-shot.mjs <url> <out.png> <card index>: one comparison card, after the charts and tiles have loaded
  import puppeteer from 'puppeteer-core'
  const [url, out, index] = process.argv.slice(2)
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 })
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 })
  await new Promise(resolve => setTimeout(resolve, 8000))
  const card = (await page.$$('article[class*="card"]'))[Number(index)]
  await card.scrollIntoView()
  // For tooltips: const box = await (await card.$('[class*="chart"]')).boundingBox(); await page.mouse.move(x, y, { steps: 8 })
  await card.screenshot({ path: out })
  await browser.close()
  ```
- To test the production build without running a server, open a made-up origin such as `http://localhost:9399` in
  puppeteer and answer its requests from `packages/website/build` with `page.setRequestInterception(true)` and
  `request.respond()` (`<path>/index.html` for page routes). MapLibre's worker requests go through it too.
- Headless windows narrower than about 500px get clipped rather than laid out narrower. Check phone widths in the
  Browser pane's viewport emulation and measure the DOM (`document.documentElement.scrollWidth`) instead. In dev mode
  the viewport meta tag only appears after hydration, so measure after the page has loaded.
- Take element screenshots of WebGL maps (`card.screenshot()`), not full-page ones: a full-page capture resizes the
  page and can catch the MapLibre canvas cleared before it redraws, which looks like a map with no basemap. Count
  pixel colors to be sure (draw the PNG onto a canvas in Chrome and read `getImageData`).
- Test hovering in every card: move the mouse over a grid of points in each chart area and read the tooltip text from
  the DOM (`[class*="tooltip"]`, ECharts' `div[style*="z-index: 9999999"]`, Nivo's absolutely positioned
  `pointer-events: none` div, `.maplibregl-popup`); Chart.js tooltips are on the canvas, so screenshot them. Record
  `pageerror` events with their stacks while hovering.

## Check the links

Every feature cell, placeholder, page and demo comment links somewhere. Before you finish:

- Internal links: `pnpm build` fails on broken paths. For anchors, grep the built page:
  `grep -q 'id="<anchor>"' packages/website/build/<path>/index.html`. Gallery links (`/gallery/view?title=…`) need
  a matching `title:` in `packages/shared/examples/*/index.tsx`.
- External links: collect them (`grep -ohE "https?://[^'\" )>]+"` over `src/comparisons` and `why-unovis`) and
  fetch each one. ag-grid.com answers scripted requests with 403; check those with `fetch()` from a browser tab that
  is on ag-grid.com, and look for the anchor ids in the returned HTML. ECharts option links are hash routes, so
  check that the option path exists in `node_modules/echarts/types` instead.
- A link that loads isn't enough: open it and check it shows the claim of the note, for that row. To review a whole
  column, run one agent per library with the checks above and ask for corrections only, with evidence.

## Gotchas

- **`*bundle*` is in the root `.gitignore`.** Files or folders with "bundle" in their name are silently never
  committed. That's why the bundle-size files are called `build-sizes.ts`, `BuildSizeChart` and
  `why-unovis-build-sizes`. Run `git check-ignore -v <paths>` on new files.
- **react-docgen-typescript** scans `src/**/*.tsx` and names each default export after its file, so the many
  `chartjs.tsx` demos would overwrite each other's docs JSON ("Cannot parse JSON" in
  `.docusaurus/docusaurus-plugin-react-docgen-typescript`). `docusaurus.config.js` excludes `src/comparisons/**`; keep
  demos there. After such an error, run `pnpm exec docusaurus clear` in `packages/website`.
- **MapLibre worker.** MapLibre 6 can't find its worker in a webpack bundle, and the worker URL `@unovis/ts` 1.7.x
  inlines is a `data:` URL webpack can't load. Without a working worker URL, maps show only the style background.
  `src/utils/maplibre-gl.ts` re-exports MapLibre and sets the URL; an alias in `docusaurus.config.js` sends every
  `maplibre-gl` import to it, and a rule there emits the worker next to `maplibre-gl-shared.mjs`, which it imports.
  Never import MapLibre from a client module or a theme component: it would ship on every page of the site.
- **No plain Leaflet maps next to Unovis maps.** An earlier version of the tile map page also rendered Leaflet and
  MapLibre GL, and two Unovis bugs broke it (see Open work): Unovis' global Leaflet stylesheet hides other maps'
  markers, and its own Leaflet replaces `window.L`, which makes Leaflet.markercluster throw on every hover. Map pages
  compare the charting libraries only, with placeholders for the ones that have no maps.
- **TopoJSONMap flows** (`enableFlowAnimation`) read coordinates from each link (`sourceLongitude`, …) and never from
  the linked points, so the choropleth demo passes four accessors that look the points up.
- **ESLint can't resolve package `exports` subpaths** such as `package/subpath`. Add
  `// eslint-disable-next-line import/no-unresolved`; `stripLintDirectives` hides it from the displayed code.
- **The website's `tsc` config fails at baseline** (a missing `@docusaurus/theme-classic` type library). To type-check,
  point a temporary tsconfig in your scratchpad at the files, with `"types": ["@docusaurus/module-type-aliases"]`.
  Expect false "cannot be used as a JSX component" errors: the monorepo has @types/react 17, 18 and 19.
- **Chart.js tree-shaking**: register everything you use. The `Colors` plugin gives default colors, `Filler` draws
  areas, and `chartjs-chart-sankey` needs `LinearScale`. A missing registration throws "… is not a registered …".
  Chart.js tooltips are drawn on the canvas, so check them in screenshots. Set `pointHoverRadius` whenever you set
  `pointRadius`: the default hover radius is 4, so bigger points shrink on hover. Missing values must be `null`;
  `spanGaps: true` plus a `segment.borderDash` callback on skipped points draws dashed bridges, like Unovis.
  Without the `Colors` plugin, datasets are a transparent gray (`rgba(0,0,0,0.1)`), which is how the choropleth's
  data centers first went invisible. The `polarArea` type has no hole and no background track: every dataset gets its
  own concentric band, so a "track" dataset is drawn as an inner ring, and the rotation comes from `scales.r.startAngle`
  (the chart-level `startAngle` in the types does nothing). In the graph plugin `borderWidth` applies to edges and nodes alike; scripted per
  edge it reads the edge from `ctx.raw`, and `pointBorderWidth` keeps the nodes as they were.
- **AG Charts** needs `ModuleRegistry.registerModules([AllCommunityModule])` before the first chart. Animations,
  crosshairs, zoom and series such as Sankey, heatmaps and maps are Enterprise-only, so the Community demos don't animate.
- **Nivo** charts need explicit margins for axes and legends, `toggleSerie` only exists on Line, Bar and Pie legends,
  the network chart draws black nodes unless you pass `nodeColor`, and line gaps need `y: null`. `@nivo/polar-bar`
  (a separate package) has no bar padding, scales the longest bar to the outer radius (no explicit max), and its
  legend lists keys, so a single key gets none.
- **Recharts** `RadialBarChart layout="centric"` grows the bars outward (polar columns) but is undocumented: no
  `background` track, bars half a slot off their ticks, and only angles animate, so value changes jump.
- **ECharts** re-creates the chart when `theme` changes (through echarts-for-react) and its dark theme paints a
  background, so set `backgroundColor: 'transparent'`. Its default tooltip shows "-" for items without a value, such as
  graph nodes, so give it a `formatter` or `valueFormatter`; a `valueFormatter` gets `undefined` for missing values.
  Its legend lists series, so a bar series with `colorBy: 'data'` (one color per bar) gets no legend entries; a
  category `angleAxis` starts the first slot at `startAngle`, so add half a slot to center the first bar at the top;
  `roundCap` only rounds tangential polar bars, radial ones need `itemStyle.borderRadius`.
- **Unovis**: `GroupedBar` and `StackedBar` take a numeric `x`, so category charts use the index plus a `tickFormat`
  with `numTicks={data.length}`; time series need `xScale={Scale.scaleTime()}` for month-aligned ticks; a crosshair on
  grouped bars uses `getCircles={() => []}`; `Graph` trims labels longer than 15 characters by default.
  `Line` draws gaps for `undefined` values and bridges them with a dashed line when `interpolateMissingData` is set.
  `Scatter` animates points by `id`, so give data stable ids. The scatter plot's crosshair
  (`snapMode: CrosshairSnapMode.XY`) gets the scatter's `x`, `y` and `color` accessors; without `color` its circle
  takes the series' palette color instead of the point's. The force layout's `forceLayoutSettings` merge into the defaults; the service map uses
  `{ linkDistance: 80, charge: -1200 }` so the multi-line labels don't overlap. `CircularBar` takes `maxValue` as an
  accessor (one goal per bar), `icon` as an `#href` into the container's `svgDefs`, and centers the first bar at the top.
- **Maps** use the public MapTiler key from `@unovis/shared/examples/basic-leaflet-map/constants` (styles `positron` and
  `dataviz-dark`), and Unovis switches between them with `styleDarkTheme`. The choropleth needs no key: every library
  draws the TopoJSON that ships with Unovis.

## Open work

Keep this list current, and remove items once they're done.

**Unovis issues these pages surfaced.** Fix them in `packages/ts`, then remove the site workarounds:

- `@unovis/ts` 1.7.x inlines MapLibre's worker and its shared chunk as base64 `data:` URLs (about 680 KB, in
  `components/leaflet-map/modules/map.js`). Webpack can't load them, so `LeafletMap` draws only the style background on
  webpack sites, unovis.dev included, and every page with a Unovis chart downloads them. Workaround:
  `src/utils/maplibre-gl.ts`.
- Unovis' Leaflet stylesheet changes Leaflet's pane `z-index`es for every map on the page, which hides the markers of
  other Leaflet maps.
- `@unovis/ts` pins Leaflet 1.7.1 and loads it when a map initializes, replacing the app's `window.L`, which breaks
  Leaflet plugins that read the global.
- TopoJSONMap's flow animation has a fallback to the coordinates of the linked points (`modules/flow.ts`), but it never
  runs, because the flow coordinate accessors always have defaults; links without coordinate fields get no particles.
- The default dark-mode grid color (`#6c778c`) is heavier than the other libraries' grids.
- `Crosshair` logs "Y accessors have not been configured" on the first render (fixed in f5/unovis#936; the smoke test
  in the bundle harness still prints the warning until it merges).

Fixed already, keep the pages in step when they merge: f5/unovis#938 (direct d3-scale imports, native `ResizeObserver`,
the `VisTimeSeries` CSS only where it's used) and f5/unovis#937 (the built-in CSS runtime that replaced Emotion, and the
dark palette on `html`-based dark themes) took the React line chart from 67.1 KB to 52.8 KB gzip. The bundle-size rows
already measure the repository build, so they include both.

**Claims to revisit when Unovis changes.** The overview's "When another library might suit you better" list (no wheel
zoom on XY charts, no keyboard navigation of data points, missing chart types) and methodology rule 5 (legend toggles
need app code) describe Unovis today. Update them, the "What to look for" bullets and `features/unovis.ts` together.

**AI agent claims.** The overview's "Ready for AI agents" card, the "Ready for AI agents" section of `docs/intro.mdx`,
the tip at the end of `docs/quick-start.mdx` and the TypeScript feature on the homepage say that config options are
documented in the type definitions, nearly all with defaults, and describe what `@unovis/mcp` does. They rest on the
`typed-docs` and `mcp-server` cells: give every new config option a `/** … Default: … */` comment, re-measure the
share when a version changes, and update the prose with the cells. unovis.dev has no `llms.txt` yet, while ECharts
and AG Charts publish one; adding one changes the Unovis `llms-txt` cell.

**More pages.** Chart types with a feature row but no page: timeline, box plot, heatmap, chord diagram, treemap,
nested donut, radial bar and flow map (`LeafletFlowMap`); the feature matrix says which
libraries can draw each. The circular bar page (f5/unovis#939's `CircularBar`) is the template for a page where several
libraries get placeholders. Libraries that may join later: Plotly.js, Victory, Observable Plot and Vega-Lite.

## Before you finish

- [ ] Every changed page works in light and dark mode and at phone width, with no console errors
- [ ] Hovering every card shows a tooltip with the same content, formatted, and throws no errors
- [ ] Every link leads to the claim it backs (see "Check the links"), and every feature row fits the page it's on
- [ ] Unovis animates on the update button; legends toggle in every library that supports it
- [ ] "What to look for" and the feature cells match what the pages actually do
- [ ] `methodology.mdx` still describes how the pages are built (rules, versions, dates)
- [ ] Lint is clean and `pnpm build` in `packages/website` passes
- [ ] `git status` lists every new file (watch for the `*bundle*` ignore pattern)
