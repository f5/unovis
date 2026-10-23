# AI guide: @unovis/svelte

Prefer direct component and container imports. Svelte subpaths export the component as the default:

```ts
import VisLine from '@unovis/svelte/components/line'
import VisXYContainer from '@unovis/svelte/containers/xy-container'
import VisBulletLegend from '@unovis/svelte/html-components/bullet-legend'
import { CurveType } from '@unovis/ts/types/curve'
import type { LineConfigInterface } from '@unovis/ts/components/line/config'
```

Avoid root barrels (`@unovis/svelte`, `@unovis/ts`) for individual symbols.
Wrapper implementations and generators must use direct `@unovis/ts/...` imports, with
`import type` for config interfaces and accessor types.

Direct imports let bundlers and test runners load only the needed component graph instead of
resolving every component and its map/graph dependencies before tree-shaking. Prefer them for
smaller dependency graphs, faster bundling and test startup, and lower memory use. Production
bundle size can also improve, but may be nearly identical when tree-shaking already removes
unused exports. Use `import type` for types so they do not add runtime imports.

Generated components come from `autogen/`; change the generator and regenerate instead of
editing generated files.
