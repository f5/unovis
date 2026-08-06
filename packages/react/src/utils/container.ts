// eslint-disable-next-line no-use-before-define
import { createContext, useContext } from 'react'

export type VisContainerContextValue = {
  /** Asks the owning container to schedule a re-render. */
  requestRender: () => void;
}

const noop = (): void => undefined

/** Lets a component wrapper ask its container to re-render.
 *
 * A component's `setConfig()` only stores the new config, it doesn't paint — containers own the render
 * loop because they're the ones that recalculate sizes, margins, scales and domains in `_preRender()`.
 * The container's own props-update effect can't be relied on to notice: `VisSingleContainer` /
 * `VisXYContainer` re-render only when *their* props change, which doesn't happen when a new accessor
 * reaches the component through React context, a parent's state, or any other path that skips the
 * container's props. Without this channel such an update sets the config and never repaints. */
export const VisContainerContext = createContext<VisContainerContextValue | undefined>(undefined)

/** Returns a callback asking the owning container to re-render.
 * No-op for components rendered outside of a Unovis container. */
export function useContainerRenderRequest (): () => void {
  return useContext(VisContainerContext)?.requestRender ?? noop
}
