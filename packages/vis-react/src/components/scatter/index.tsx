// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef } from 'react'
import { Scatter, ScatterConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisScatterRef<Datum> = {
  component: Scatter<Datum>;
}

export type VisScatterProps<Datum> = ScatterConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisScatterRef<Datum>>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisScatterFC<Datum> (props: VisScatterProps<Datum>, fRef: ForwardedRef<VisScatterRef<Datum>>): JSX.Element {
  const ref = useRef<VisComponentElement<Scatter<Datum>>>(null)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Scatter<Datum>>)
    element.__component__?.destroy() // Destroy component if exists already (to comply with React 18 strict mode, which renders components twice in dev mode)
    element.__component__ = new Scatter(props)
    // We don't have a clean up function because the component will be destroyed by its container (e.g. XYContainer or SingleContainer)
  }, [])

  // On Props Update
  useEffect(() => {
    const component = (ref.current as VisComponentElement<Scatter<Datum>>).__component__
    if (props.data) component?.setData(props.data)
    component?.setConfig(props)
  })

  useImperativeHandle(fRef, () => ({ component: (ref.current as VisComponentElement<Scatter<Datum>>).__component__ }))
  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisScatter: (<Datum>(props: VisScatterProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisScatterFC), arePropsEqual)
