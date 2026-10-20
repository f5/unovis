# AI guide: @unovis/react

Prefer direct component and container imports:

```tsx
import { VisLine } from '@unovis/react/components/line'
import { VisXYContainer } from '@unovis/react/containers/xy-container'
import { CurveType } from '@unovis/ts/types/curve'
import type { LineConfigInterface } from '@unovis/ts/components/line/config'
```

Avoid root barrels (`@unovis/react`, `@unovis/ts`) for individual symbols.
Direct imports let bundlers and test runners load only the needed component graph instead of
resolving every component and its map/graph dependencies before tree-shaking. Prefer them for
smaller dependency graphs, faster bundling and test startup, and lower memory use. Production
bundle size can also improve, but may be nearly identical when tree-shaking already removes
unused exports. Use `import type` for types so they do not add runtime imports.

Wrapper implementations must also import the core class and its types from direct
`@unovis/ts/...` paths. Generated components come from `autogen/`; change the generator
and regenerate instead of editing generated files.
