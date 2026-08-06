// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Crosshair } from '@unovis/ts/components/crosshair'
import { CrosshairConfigInterface } from '@unovis/ts/components/crosshair/config'

// Utils
import { arePropsEqual } from 'src/utils/react'
import { useContainerRenderRequest } from 'src/utils/container'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisCrosshairRef<Datum> = {
  component?: Crosshair<Datum>;
}

export type VisCrosshairProps<Datum> = CrosshairConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisCrosshairRef<Datum>>;
}

export const VisCrosshairSelectors = Crosshair.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisCrosshairFC<Datum> (props: VisCrosshairProps<Datum>, fRef: ForwardedRef<VisCrosshairRef<Datum>>): ReactElement {
  const ref = useRef<VisComponentElement<Crosshair<Datum>>>(null)
  const componentRef = useRef<Crosshair<Datum> | undefined>(undefined)
  const requestContainerRender = useContainerRenderRequest()
  const prevPropsRef = useRef<VisCrosshairProps<Datum> | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Crosshair<Datum>>)

    const c = new Crosshair<Datum>(props)
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
    if (props.data) component?.setData(props.data)
    component?.setConfig(props)
    // A config change has to drive the render itself. The container re-renders only when its own props
    // change, which doesn't happen when the new config reaches this component through React context or
    // a parent's state. Skipped on the first run: the container renders on mount.
    if (prevPropsRef.current !== undefined && !arePropsEqual(prevPropsRef.current, props)) requestContainerRender()
    prevPropsRef.current = props
  })

  useImperativeHandle(fRef, () => ({ get component () { return componentRef.current } }), [])
  return <vis-crosshair ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisCrosshair: (<Datum>(props: VisCrosshairProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisCrosshairFC), arePropsEqual)
