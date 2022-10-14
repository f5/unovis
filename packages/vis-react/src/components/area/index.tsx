// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Area, AreaConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisAreaRef<Datum> = {
  component?: Area<Datum>;
}

export type VisAreaProps<Datum> = AreaConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisAreaRef<Datum>>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisAreaFC<Datum> (props: VisAreaProps<Datum>, fRef: ForwardedRef<VisAreaRef<Datum>>): JSX.Element {
  const ref = useRef<VisComponentElement<Area<Datum>>>(null)
  const [component, setComponent] = useState<Area<Datum>>()

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Area<Datum>>)

    // React 18 in Strict Mode renders components twice. At the same time, a Container that contains this component
    // (e.g. XYContainer) will be updated only after the first render. So we need to make sure that the component will
    // be initialized only once and won't get destroyed after the first render
    const hasAlreadyBeenInitialized = element.__component__
    const c = element.__component__ || new Area<Datum>(props)
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
  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisArea: (<Datum>(props: VisAreaProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisAreaFC), arePropsEqual)
