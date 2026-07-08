// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef } from 'react'
import { Crosshair } from '@unovis/ts/components/crosshair'
import { CrosshairConfigInterface } from '@unovis/ts/components/crosshair/config'

// Utils
import { arePropsEqual } from 'src/utils/react'

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
  // Separate the config properties from the props that should not be passed to the component
  const { data, ...config } = props

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Crosshair<Datum>>)

    const c = new Crosshair<Datum>(config)
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
    if (data) component?.setData(data)
    component?.setConfig(config)
  })

  useImperativeHandle(fRef, () => ({ get component () { return componentRef.current } }), [])
  return <vis-crosshair ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisCrosshair: (<Datum>(props: VisCrosshairProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisCrosshairFC), arePropsEqual)
