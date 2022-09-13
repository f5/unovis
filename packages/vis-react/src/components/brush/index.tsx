// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef } from 'react'
import { Brush, BrushConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisBrushRef<Datum> = {
  component: Brush<Datum>;
}

export type VisBrushProps<Datum> = BrushConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisBrushRef<Datum>>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisBrushFC<Datum> (props: VisBrushProps<Datum>, fRef: ForwardedRef<VisBrushRef<Datum>>): JSX.Element {
  const ref = useRef<VisComponentElement<Brush<Datum>>>(null)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Brush<Datum>>)
    element.__component__?.destroy() // Destroy component if exists already (to comply with React 18 strict mode, which renders components twice in dev mode)
    element.__component__ = new Brush(props)
    // We don't have a clean up function because the component will be destroyed by its container (e.g. XYContainer or SingleContainer)
  }, [])

  // On Props Update
  useEffect(() => {
    const component = (ref.current as VisComponentElement<Brush<Datum>>).__component__
    if (props.data) component?.setData(props.data)
    component?.setConfig(props)
  })

  useImperativeHandle(fRef, () => ({ component: (ref.current as VisComponentElement<Brush<Datum>>).__component__ }))
  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisBrush: (<Datum>(props: VisBrushProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisBrushFC), arePropsEqual)
