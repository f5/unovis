# AI guide: @unovis/ssr

Prefer direct modules over barrels for new internal imports, and use `import type` for types.
For browser chart code and bundle-based tests, import core classes from their defining paths:

```ts
import { Line } from '@unovis/ts/components/line'
import { CurveType } from '@unovis/ts/types/curve'
```

Direct imports let bundlers and test runners load only the needed component graph instead of
resolving every component and its map/graph dependencies before tree-shaking. Prefer them for
smaller dependency graphs, faster bundling and test startup, and lower memory use. Production
bundle size can also improve, but may be nearly identical when tree-shaking already removes
unused exports. Use `import type` for types so they do not add runtime imports.

The SSR package exports only its public root API; use `@unovis/ssr` for external consumers
rather than inventing unsupported subpaths. Preserve the existing environment initialization
and deferred Unovis loading: headless callbacks receive the initialized library through their
context. Do not move browser-dependent imports ahead of DOM setup merely to use a direct path.
For native Node ESM imports of core files, include `/index.js` or `.js` as appropriate.
