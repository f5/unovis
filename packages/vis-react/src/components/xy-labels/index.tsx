// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef } from 'react'
import { XYLabels, XYLabelsConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisXYLabelsRef<Datum> = {
  component: XYLabels<Datum>;
}

export type VisXYLabelsProps<Datum> = XYLabelsConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisXYLabelsRef<Datum>>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisXYLabelsFC<Datum> (props: VisXYLabelsProps<Datum>, fRef: ForwardedRef<VisXYLabelsRef<Datum>>): JSX.Element {
  const ref = useRef<VisComponentElement<XYLabels<Datum>>>(null)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<XYLabels<Datum>>)
    element.__component__?.destroy() // Destroy component if exists already (to comply with React 18 strict mode, which renders components twice in dev mode)
    element.__component__ = new XYLabels(props)
    // We don't have a clean up function because the component will be destroyed by its container (e.g. XYContainer or SingleContainer)
  }, [])

  // On Props Update
  useEffect(() => {
    const component = (ref.current as VisComponentElement<XYLabels<Datum>>).__component__
    if (props.data) component?.setData(props.data)
    component?.setConfig(props)
  })

  useImperativeHandle(fRef, () => ({ component: (ref.current as VisComponentElement<XYLabels<Datum>>).__component__ }))
  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisXYLabels: (<Datum>(props: VisXYLabelsProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisXYLabelsFC), arePropsEqual)
