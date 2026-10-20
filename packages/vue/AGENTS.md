# AI guide: @unovis/vue

Prefer direct component and container imports. Vue subpaths export the component as the default:

```ts
import VisLine from '@unovis/vue/components/line'
import VisXYContainer from '@unovis/vue/containers/xy-container'
import { CurveType } from '@unovis/ts/types/curve'
import type { LineConfigInterface } from '@unovis/ts/components/line/config'
```

Avoid root barrels (`@unovis/vue`, `@unovis/ts`) for individual symbols.
Direct imports let bundlers and test runners load only the needed component graph instead of
resolving every component and its map/graph dependencies before tree-shaking. Prefer them for
smaller dependency graphs, faster bundling and test startup, and lower memory use. Production
bundle size can also improve, but may be nearly identical when tree-shaking already removes
unused exports. Use `import type` for types so they do not add runtime imports.

Wrapper implementations must also import the core class and its types from direct
`@unovis/ts/...` paths. Keep these subpaths external in library builds. Generated components
come from `autogen/`; change the generator and regenerate instead of editing generated files.
