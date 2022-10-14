// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Axis, AxisConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisAxisRef<Datum> = {
  component?: Axis<Datum>;
}

export type VisAxisProps<Datum> = AxisConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisAxisRef<Datum>>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisAxisFC<Datum> (props: VisAxisProps<Datum>, fRef: ForwardedRef<VisAxisRef<Datum>>): JSX.Element {
  const ref = useRef<VisComponentElement<Axis<Datum>>>(null)
  const [component, setComponent] = useState<Axis<Datum>>()

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Axis<Datum>>)

    // React 18 in Strict Mode renders components twice. At the same time, a Container that contains this component
    // (e.g. XYContainer) will be updated only after the first render. So we need to make sure that the component will
    // be initialized only once and won't get destroyed after the first render
    const hasAlreadyBeenInitialized = element.__component__
    const c = element.__component__ || new Axis<Datum>(props)
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
  return <vis-axis ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisAxis: (<Datum>(props: VisAxisProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisAxisFC), arePropsEqual)
