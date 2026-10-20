# AI guide: shared examples and integration generators

Prefer direct imports in new gallery examples and generated wrappers:

```ts
import { Line } from '@unovis/ts/components/line'
import { CurveType } from '@unovis/ts/types/curve'
import type { LineConfigInterface } from '@unovis/ts/components/line/config'
```

Use framework component/container subpaths where publicly exported (see each framework's
`AGENTS.md`). Vue component subpaths use default exports. Angular has a single flattened
entry point; verify Svelte's exports before recommending subpaths.

Direct imports let bundlers and test runners load only the needed component graph instead of
resolving every component and its map/graph dependencies before tree-shaking. Prefer them for
smaller dependency graphs, faster bundling and test startup, and lower memory use. Production
bundle size can also improve, but may be nearly identical when tree-shaking already removes
unused exports. Use `import type` for types so they do not add runtime imports.

Pass `getConfigSummary`'s `importSourceMap` to `getImportStatements` in every wrapper
generator. Resolve core `@/` aliases and relative imports to public `@unovis/ts/...` paths;
keep third-party imports unchanged. Change generators and regenerate wrappers rather than
editing generated files. Keep core subpaths external in wrapper library builds.
