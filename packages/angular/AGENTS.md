# AI guide: @unovis/angular

Import core enums and types directly from their defining modules:

```ts
import { VisLineModule, VisXYContainerModule } from '@unovis/angular'
import { CurveType } from '@unovis/ts/types/curve'
import type { LineConfigInterface } from '@unovis/ts/components/line/config'
```

Angular currently publishes a single flattened entry point. Its public API requires named
imports from `@unovis/angular`; do not invent `@unovis/angular/components/...` subpaths.
The package's wrappers and generators must use direct `@unovis/ts/...` imports rather than
its root barrel. The Angular entry point still visits all wrapper components during bundling.

Direct imports let bundlers and test runners load only the needed component graph instead of
resolving every component and its map/graph dependencies before tree-shaking. Prefer them for
smaller dependency graphs, faster bundling and test startup, and lower memory use. Production
bundle size can also improve, but may be nearly identical when tree-shaking already removes
unused exports. Use `import type` for types so they do not add runtime imports.

Generated components come from `autogen/`; change the generator and regenerate instead of
editing generated files.
