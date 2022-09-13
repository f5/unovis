// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef } from 'react'
import { Donut, DonutConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisDonutRef<Datum> = {
  component: Donut<Datum>;
}

export type VisDonutProps<Datum> = DonutConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisDonutRef<Datum>>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisDonutFC<Datum> (props: VisDonutProps<Datum>, fRef: ForwardedRef<VisDonutRef<Datum>>): JSX.Element {
  const ref = useRef<VisComponentElement<Donut<Datum>>>(null)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Donut<Datum>>)
    element.__component__?.destroy() // Destroy component if exists already (to comply with React 18 strict mode, which renders components twice in dev mode)
    element.__component__ = new Donut(props)
    // We don't have a clean up function because the component will be destroyed by its container (e.g. XYContainer or SingleContainer)
  }, [])

  // On Props Update
  useEffect(() => {
    const component = (ref.current as VisComponentElement<Donut<Datum>>).__component__
    if (props.data) component?.setData(props.data)
    component?.setConfig(props)
  })

  useImperativeHandle(fRef, () => ({ component: (ref.current as VisComponentElement<Donut<Datum>>).__component__ }))
  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisDonut: (<Datum>(props: VisDonutProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisDonutFC), arePropsEqual)
