// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Crosshair, CrosshairConfigInterface } from '@unovis/ts'

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

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisCrosshairFC<Datum> (props: VisCrosshairProps<Datum>, fRef: ForwardedRef<VisCrosshairRef<Datum>>): JSX.Element {
  const ref = useRef<VisComponentElement<Crosshair<Datum>>>(null)
  const [component, setComponent] = useState<Crosshair<Datum>>()

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Crosshair<Datum>>)

    // React 18 in Strict Mode renders components twice. At the same time, a Container that contains this component
    // (e.g. XYContainer) will be updated only after the first render. So we need to make sure that the component will
    // be initialized only once and won't get destroyed after the first render
    const hasAlreadyBeenInitialized = element.__component__
    const c = element.__component__ || new Crosshair<Datum>(props)
    setComponent(c)
    element.__component__ = c

    return () => hasAlreadyBeenInitialized && c.destroy()
  }, [])

  // On Props Update
  useEffect(() => {
    if (props.data) component?.setData(props.data)
    component?.setConfig(props)
  })

  useImperativeHandle(fRef, () => ({ component }), [component])
  return <vis-crosshair ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisCrosshair: (<Datum>(props: VisCrosshairProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisCrosshairFC), arePropsEqual)
