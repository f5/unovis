# Direct import measurements — PR #876

Measured on 2026-10-19 after rebasing onto `main` at
`209fbb2f197c595bbac3d8e406aae00db9abe9a2`.

## Method

- Node v24.1.0, Vite 7.3.6, Vitest 4.1.11, macOS arm64.
- Build the core first, then all five framework packages using the repository scripts.
- Copy built package contents into an isolated consumer's `node_modules/@unovis` using
  their published directory layouts and package manifests. Resolve real third-party
  dependencies locally; no aliases or externalized framework/core dependencies.
- Each fixture imports just `Line` or `VisLine` and retains it on `globalThis.UnovisLine`.
  Compare a named root import with the component subpath. Vue and Svelte subpaths use default imports.
- Vite production builds: `configFile: false`, `write: false`, `minify: 'esbuild'`,
  `target: 'es2020'`, one JS entry. Include framework runtime dependencies. Svelte uses
  the Svelte Vite plugin with explicit browser/module/production resolve conditions to retain
  the browser lifecycle implementation on Vite 7.
- Five fresh Node processes per case, run sequentially with alternating barrel/direct order.
  Report medians. Filesystem caches are warm; these are not cold-disk measurements.
- Module counts include transformed dependencies before tree-shaking. Output bytes sum all
  chunks/assets, excluding sourcemaps; gzip each output separately. Peak RSS is the whole
  build process, including Vite and configuration overhead.

## Consumer builds

| Package | Import | Modules | Build time | Peak RSS | Output bytes | Gzip bytes |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| TypeScript | Root | 1,536 | 2,342 ms | 1,178 MiB | 126,344 | 41,835 |
| TypeScript | Direct | 363 | 453 ms | 306 MiB | 126,348 | 41,842 |
| React | Root | 1,568 | 2,368 ms | 1,178 MiB | 135,388 | 45,167 |
| React | Direct | 372 | 471 ms | 310 MiB | 134,890 | 45,034 |
| Vue | Root | 1,566 | 2,464 ms | 1,223 MiB | 152,129 | 51,620 |
| Vue | Direct | 371 | 572 ms | 341 MiB | 151,636 | 51,527 |
| Solid | Root | 1,566 | 2,397 ms | 1,194 MiB | 133,431 | 44,345 |
| Solid | Direct | 368 | 473 ms | 315 MiB | 133,431 | 44,495 |
| Svelte | Root | 1,593 | 2,553 ms | 1,087 MiB | 131,453 | 43,644 |
| Svelte | Direct | 389 | 519 ms | 316 MiB | 131,461 | 43,995 |

Direct imports process 76–77% fewer modules, take 77–81% less build time (4.3–5.2× faster),
and use 71–74% less peak memory. All direct cases avoid the 257 modules belonging to
`elkjs`, `three`, `leaflet`, `maplibre-gl`, `@unovis/dagre-layout`, and `@unovis/graphlibrary`
that the root cases visit.

Final gzip size changes by less than 1%. React saves 133 bytes and Vue saves 93 bytes;
TypeScript grows by 7 bytes, Solid by 150 bytes, and Svelte by 351 bytes due to generated
code/compression variation. Tree-shaking already eliminates unused components from these production bundles.
The measured benefit is principally bundler traversal, time, and memory, not a substantial
production download reduction. Larger applications and different bundlers may differ.

## Test startup

Run the same one-test Vitest fixture in jsdom against the built TypeScript package. The test
imports `Line` and asserts the export exists. Five fresh CLI processes per import style,
alternating order, with default dependency handling and no application setup files.

| Import | Median import time | Median CLI wall time |
| --- | ---: | ---: |
| Root | 283 ms | 935 ms |
| Direct | 105 ms | 751 ms |

Direct imports cut import time by 63% and complete this small test run about 20% faster.
These figures measure startup overhead; they do not imply that individual assertions or
an entire application's test suite run 20% faster.

## Packaging limits

Vue, Solid, and Svelte expose component subpaths through their package exports; React and
TypeScript publish the component files directly. Angular exposes a single flattened entry point, so
its consumers must retain `@unovis/angular` named imports while using direct core imports
for enums/types. Svelte exports component, HTML-component, and container subpaths, each with
a default component export and a declaration-file condition. All 33 runtime subpaths resolve;
the two Leaflet map declaration files remain absent because of the existing packaging diagnostics
below. The other 31 declaration targets exist, and the line/container/legend consumer fixture
type-checks. Angular wrapper-internal direct core imports remain useful.

## Verification

- Core and React/Angular/Svelte/Vue/Solid builds pass. Vue type checking and Svelte checking
  pass; Svelte packaging reports existing non-portable inferred types for the two map
  components' declarations.
- Existing core tests: 6 files, 13 tests pass.
- Dev production build passes with webpack asset-size warnings.
- SSR and MCP builds pass.
- The multi-framework gallery renders the line and lazy ELK graph examples in all six panels.
- Package dry runs verify that published packages include their `AGENTS.md` instructions.
- An isolated Svelte consumer builds and renders a line chart and legend using public direct
  imports. Its TypeScript fixture checks chart, container, and HTML-component declarations.
- Repository lint reports 14 existing errors in unchanged files (missing imports and the
  Solid root stubs' tsconfig coverage). ESLint passes across the 117 changed code files
  with warnings only.
