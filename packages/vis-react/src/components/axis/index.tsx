// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef } from 'react'
import { Axis, AxisConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisAxisRef<Datum> = {
  component: Axis<Datum>;
}

export type VisAxisProps<Datum> = AxisConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisAxisRef<Datum>>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisAxisFC<Datum> (props: VisAxisProps<Datum>, fRef: ForwardedRef<VisAxisRef<Datum>>): JSX.Element {
  const ref = useRef<VisComponentElement<Axis<Datum>>>(null)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Axis<Datum>>)
    element.__component__?.destroy() // Destroy component if exists already (to comply with React 18 strict mode, which renders components twice in dev mode)
    element.__component__ = new Axis(props)
    // We don't have a clean up function because the component will be destroyed by its container (e.g. XYContainer or SingleContainer)
  }, [])

  // On Props Update
  useEffect(() => {
    const component = (ref.current as VisComponentElement<Axis<Datum>>).__component__
    if (props.data) component?.setData(props.data)
    component?.setConfig(props)
  })

  useImperativeHandle(fRef, () => ({ component: (ref.current as VisComponentElement<Axis<Datum>>).__component__ }))
  return <vis-axis ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisAxis: (<Datum>(props: VisAxisProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisAxisFC), arePropsEqual)
