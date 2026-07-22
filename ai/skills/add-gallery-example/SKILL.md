---
name: add-gallery-example
description: >-
  Add an example to the Unovis gallery — a per-framework example directory under
  packages/shared/examples, registered in examples-list.tsx, with light/dark previews. Use when
  asked to add a gallery example, showcase a chart in the gallery, or create the gallery entry that
  accompanies a new component.
---

# Adding a gallery example

Examples live in **`packages/shared/examples/`** (consumed by both the website gallery and the
multi-framework playground). The public guide
`packages/website/contributing/guides/gallery-examples.mdx` covers the same ground in prose.

## 1. Create `packages/shared/examples/<slug>/`

`<slug>` is kebab-case (e.g. `basic-line-chart`). Add one implementation per framework plus data
and index:

```
<slug>/
├── data.ts                 # typed dataset: export const data = [...]
├── index.tsx               # website metadata (template below)
├── <slug>.tsx              # React
├── <slug>.ts               # vanilla TypeScript  (entry MUST be named exactly <slug>.ts)
├── <slug>-solid.tsx        # Solid
├── <slug>.svelte           # Svelte
├── <slug>.vue              # Vue
├── <slug>.component.html   # ┓
├── <slug>.component.ts     # ┠ Angular
└── <slug>.module.ts        # ┛
```

Copy an existing example (e.g. `packages/shared/examples/basic-line-chart`) to get every framework
file right.

## 2. `index.tsx` (current shape — includes all six frameworks)

```tsx
/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import React from 'react'
import type { Example } from '../types'

const pathname = '<slug>'
const example: Example = {
  component: () => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Component = require(`./${pathname}.tsx`).default
    return <Component />
  },
  pathname,
  title: '<Title referencing the component(s)>',
  description: '',
  codeReact: require(`!!raw-loader!./${pathname}.tsx`).default,
  codeSolid: require(`!!raw-loader!./${pathname}-solid.tsx`).default,
  codeTs: require(`!!raw-loader!./${pathname}.ts`).default,
  codeAngular: {
    html: require(`!!raw-loader!./${pathname}.component.html`).default,
    component: require(`!!raw-loader!./${pathname}.component.ts`).default,
    module: require(`!!raw-loader!./${pathname}.module.ts`).default,
  },
  codeSvelte: require(`!!raw-loader!./${pathname}.svelte`).default,
  codeVue: require(`!!raw-loader!./${pathname}.vue`).default,
  data: require('!!raw-loader!./data').default,
  preview: require(`../_previews/${pathname}.png`).default,
  previewDark: require(`../_previews/${pathname}-dark.png`).default,
}

export default example
```

- `pathname` must equal the directory name.
- `title` references the library component(s) used; `description` can be `''` or JSX with cited data sources.

## 3. Register in `examples-list.tsx`

Add `require('./<slug>').default` to the appropriate category's `examples` array in
`packages/shared/examples/examples-list.tsx` (or add a new category object). This drives the website
gallery ordering.

## 4. Add previews

Add light + dark screenshots to `packages/shared/examples/_previews/<slug>.png` and
`packages/shared/examples/_previews/<slug>-dark.png`.

## 5. Verify every framework

- **Multi-framework playground:** `pnpm dev:gallery`, open the printed URL, pick your example in the
  sidebar. It mounts React, Vue, Solid, Svelte, and vanilla TS side by side. **No manual
  registration** — examples are auto-discovered from `packages/shared/examples/*` by Vite globs. The
  TS panel only mounts a file named exactly `<slug>.ts`; `data.ts`/`types.ts` are treated as helpers.
  (Angular is not in this playground — verify Angular on the website.)
- **Website:** `pnpm website` (http://localhost:9300), navigate to your example; the page shows the
  rendered React example plus the code for every framework.

Commit per `/commit` (gallery work → `Shared | Gallery:` or, alongside a component, the
`Website: <Name> docs and gallery example` commit) and open the PR with `/open-pr`.
