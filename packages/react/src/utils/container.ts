import { createContext, useContext, useEffect, useRef } from 'react'

export type VisContainerContextValue = {
  /** Asks the owning container to schedule a re-render. */
  requestRender: () => void;
}

/** Lets a component wrapper ask its container to re-render.
 *
 * A component's `setConfig()` only stores the new config, it doesn't paint — containers own the
 * render loop because they're the ones that recalculate sizes, margins, scales and shared domains
 * in `_preRender()`. The container's own props-update effect can't be relied on to notice a
 * component-level change: `VisSingleContainer` / `VisXYContainer` re-render only when *their*
 * props change, which doesn't happen when a new accessor reaches the component through React
 * context, a parent's state, or any other path that skips the container's props. Without this
 * channel such an update sets the config and never repaints. */
export const VisContainerContext = createContext<VisContainerContextValue | undefined>(undefined)

/** Asks the owning container to re-render whenever this component's props change.
 *
 * No equality check is needed here: component wrappers are memoized with `arePropsEqual` and hold
 * no state or changing context, so after the initial mount they re-render — and re-run this
 * effect — only when their props have actually changed. The mount run is skipped because
 * containers render on mount anyway. No-op for components rendered outside of a Unovis
 * container. */
export function useContainerRenderOnUpdate (): void {
  const requestRender = useContext(VisContainerContext)?.requestRender
  const isInitialRunRef = useRef(true)

  useEffect(() => {
    if (isInitialRunRef.current) {
      isInitialRunRef.current = false
      return () => { isInitialRunRef.current = true }
    }
    requestRender?.()
  })
}
