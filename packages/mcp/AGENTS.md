# AI guide: @unovis/mcp

Prefer direct imports for core components, enums, and types in new browser code and snippets:

```ts
import { Line } from '@unovis/ts/components/line'
import { CurveType } from '@unovis/ts/types/curve'
import type { LineConfigInterface } from '@unovis/ts/components/line/config'
```

Direct imports let bundlers and test runners load only the needed component graph instead of
resolving every component and its map/graph dependencies before tree-shaking. Prefer them for
smaller dependency graphs, faster bundling and test startup, and lower memory use. Production
bundle size can also improve, but may be nearly identical when tree-shaking already removes
unused exports. Use `import type` for types so they do not add runtime imports.

Preserve headless rendering's existing DOM setup and deferred loading. Do not hoist core
runtime imports into server modules that execute before the environment is initialized.
Use only exported MCP entry points (`@unovis/mcp`, `@unovis/mcp/recipes`, `@unovis/mcp/spec`)
from external consumers; use direct relative files internally. Keep the widget's existing
workspace-specific `dist` resolution separate from paths emitted for installed packages.
