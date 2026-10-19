import React, { ForwardedRef } from 'react'

import { useComponentConfig } from '../components/ExampleControls/useComponentConfig'
import { getCaptureSettings } from './settings'

export function withDevConfig<T extends (props: never) => React.ReactElement | null> (name: string, component: T): T {
  // Preserve each component's generic public signature while sharing the runtime wrapper.
  const renderComponent = component as unknown as React.ComponentType<{ duration?: number; ref?: ForwardedRef<unknown> }>

  // eslint-disable-next-line @typescript-eslint/naming-convention
  function DevComponent (props: { duration?: number }, ref: ForwardedRef<unknown>): React.ReactElement {
    const { config } = useComponentConfig(name, props)
    return React.createElement(renderComponent, { ...config, ref, ...(getCaptureSettings() ? { duration: 0 } : {}) })
  }

  return React.forwardRef(DevComponent) as unknown as T
}
