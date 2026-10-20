# AI guide: @unovis/ts

Prefer direct imports from the module that defines each symbol:

```ts
import { Line } from '@unovis/ts/components/line'
import { XYContainer } from '@unovis/ts/containers/xy-container'
import { CurveType } from '@unovis/ts/types/curve'
import type { LineConfigInterface } from '@unovis/ts/components/line/config'
```

Avoid the `@unovis/ts` root barrel for individual components, enums, utilities, and types.
For native Node ESM, use explicit file paths such as
`@unovis/ts/components/line/index.js` and `@unovis/ts/types/curve.js`.

Direct imports let bundlers and test runners load only the needed component graph instead of
resolving every component and its map/graph dependencies before tree-shaking. Prefer them for
smaller dependency graphs, faster bundling and test startup, and lower memory use. Production
bundle size can also improve, but may be nearly identical when tree-shaking already removes
unused exports. Use `import type` for types so they do not add runtime imports.

Inside this repository, import core modules through their existing `@/components/...`,
`@/types/...`, or relative paths. Workspace consumers resolve public subpaths against
`packages/ts/dist`; published packages already have that directory as their root. Do not put
`dist` or `src` into imports intended for installed packages.
