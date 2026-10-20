# AI guide: website and documentation

Use direct imports in new snippets and examples when the package exposes them:

```tsx
import { VisLine } from '@unovis/react/components/line'
import { VisXYContainer } from '@unovis/react/containers/xy-container'
import { CurveType } from '@unovis/ts/types/curve'
import type { LineConfigInterface } from '@unovis/ts/components/line/config'
```

Vue and Svelte subpaths use default imports; Solid uses named imports. Angular has a single
flattened entry point. Follow the relevant package's `AGENTS.md` and verify snippets against
its published layout.

Direct imports let bundlers and test runners load only the needed component graph instead of
resolving every component and its map/graph dependencies before tree-shaking. Prefer them for
smaller dependency graphs, faster bundling and test startup, and lower memory use. Production
bundle size can also improve, but may be nearly identical when tree-shaking already removes
unused exports. Use `import type` for types so they do not add runtime imports.

Keep existing workspace aliases and loader configuration when resolving local packages.
