// This file intentionally avoids JSX so the Solid Vite plugin (scoped to
// *-solid.tsx) doesn't need to process it. The actual Solid example component
// file *is* matched by the plugin and compiled to Solid DOM.
import { render } from 'solid-js/web'

type SolidComponent = (props?: Record<string, unknown>) => unknown

// eslint-disable-next-line @typescript-eslint/naming-convention
export function mountSolid (target: HTMLElement, Component: SolidComponent): void {
  render(() => Component({}) as never, target)
}
