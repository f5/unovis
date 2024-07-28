import type { Accessor } from 'solid-js'
import { createContext, useContext } from 'solid-js'

type VisContainerContextType =
  | 'component'
  | 'axis'
  | 'tooltip'
  | 'annotations'
  | 'crosshair'

export type VisContainerContextProps = {
  update: (key: VisContainerContextType, value: Accessor<unknown>) => void
  destroy: (key: VisContainerContextType, value?: unknown) => void
  dirty: VoidFunction
}

export const VisContainerContext = createContext<VisContainerContextProps>({
  update: () => null,
  destroy: () => null,
  dirty: () => null,
})

export const useVisContainer = () => useContext(VisContainerContext)
