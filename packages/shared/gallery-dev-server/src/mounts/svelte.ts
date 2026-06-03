// Svelte 4 mount API. The `intro: true` flag lets transitions run and onMount
// callbacks queue normally; we `await tick()` so deeply-nested children are
// fully wired before the next panel mounts.
import { tick } from 'svelte'

type SvelteCtor = new (opts: { target: Element; props?: Record<string, unknown>; intro?: boolean }) => unknown

// eslint-disable-next-line @typescript-eslint/naming-convention
export async function mountSvelte (target: HTMLElement, Component: SvelteCtor): Promise<void> {
  // eslint-disable-next-line no-new
  new Component({ target, intro: true })
  await tick()
}
