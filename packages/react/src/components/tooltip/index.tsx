// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Tooltip } from '@unovis/ts/components/tooltip'
import { TooltipConfigInterface } from '@unovis/ts/components/tooltip/config'

// Utils
import { arePropsEqual } from 'src/utils/react'
import { useContainerRenderRequest } from 'src/utils/container'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisTooltipRef = {
  component?: Tooltip;
}

export type VisTooltipProps = TooltipConfigInterface & {
  ref?: Ref<VisTooltipRef>;
}

export const VisTooltipSelectors = Tooltip.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisTooltipFC (props: VisTooltipProps, fRef: ForwardedRef<VisTooltipRef>): ReactElement {
  const ref = useRef<VisComponentElement<Tooltip>>(null)
  const componentRef = useRef<Tooltip | undefined>(undefined)
  const requestContainerRender = useContainerRenderRequest()
  const prevPropsRef = useRef<VisTooltipProps | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Tooltip>)

    const c = new Tooltip(props)
    componentRef.current = c
    element.__component__ = c

    return () => {
      componentRef.current = undefined
      c.destroy()
    }
  }, [])

  // On Props Update
  useEffect(() => {
    const component = componentRef.current

    component?.setConfig(props)
    // A config change has to drive the render itself. The container re-renders only when its own props
    // change, which doesn't happen when the new config reaches this component through React context or
    // a parent's state. Skipped on the first run: the container renders on mount.
    if (prevPropsRef.current !== undefined && !arePropsEqual(prevPropsRef.current, props)) requestContainerRender()
    prevPropsRef.current = props
  })

  useImperativeHandle(fRef, () => ({ get component () { return componentRef.current } }), [])
  return <vis-tooltip ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisTooltip: ((props: VisTooltipProps) => JSX.Element | null) = React.memo(React.forwardRef(VisTooltipFC), arePropsEqual)
