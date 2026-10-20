# AI guide: dev app

Use direct imports in new examples and tests:

```tsx
import { Line } from '@unovis/ts/components/line'
import { VisLine } from '@unovis/react/components/line'
import { VisXYContainer } from '@unovis/react/containers/xy-container'
import type { LineConfigInterface } from '@unovis/ts/components/line/config'
```

Avoid `@unovis/ts` and framework root barrels for individual symbols when a public direct
import exists. Preserve the app's existing workspace aliases for resolving built packages.

Direct imports let bundlers and test runners load only the needed component graph instead of
resolving every component and its map/graph dependencies before tree-shaking. Prefer them for
smaller dependency graphs, faster bundling and test startup, and lower memory use. Production
bundle size can also improve, but may be nearly identical when tree-shaking already removes
unused exports. Use `import type` for types so they do not add runtime imports.
