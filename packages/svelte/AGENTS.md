# AI guide: @unovis/svelte

Import core enums and types directly from their defining modules:

```ts
import { CurveType } from '@unovis/ts/types/curve'
import type { LineConfigInterface } from '@unovis/ts/components/line/config'
```

The package currently exports only its root entry point, so installed consumers must use
`import { VisLine, VisXYContainer } from '@unovis/svelte'`. Do not invent component subpaths
without adding and verifying public package exports. The Svelte barrel still visits all wrappers.
Wrapper implementations and generators must use direct `@unovis/ts/...` imports, with
`import type` for config interfaces and accessor types.

Direct imports let bundlers and test runners load only the needed component graph instead of
resolving every component and its map/graph dependencies before tree-shaking. Prefer them for
smaller dependency graphs, faster bundling and test startup, and lower memory use. Production
bundle size can also improve, but may be nearly identical when tree-shaking already removes
unused exports. Use `import type` for types so they do not add runtime imports.

Generated components come from `autogen/`; change the generator and regenerate instead of
editing generated files.
