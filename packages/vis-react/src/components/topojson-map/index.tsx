// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { TopoJSONMap, TopoJSONMapConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisTopoJSONMapRef<AreaDatum, PointDatum, LinkDatum> = {
  component?: TopoJSONMap<AreaDatum, PointDatum, LinkDatum>;
}

export type VisTopoJSONMapProps<AreaDatum, PointDatum, LinkDatum> = TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum> & {
  data?: {areas?: AreaDatum[]; points?: PointDatum[]; links?: LinkDatum[]};
  ref?: Ref<VisTopoJSONMapRef<AreaDatum, PointDatum, LinkDatum>>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisTopoJSONMapFC<AreaDatum, PointDatum, LinkDatum> (props: VisTopoJSONMapProps<AreaDatum, PointDatum, LinkDatum>, fRef: ForwardedRef<VisTopoJSONMapRef<AreaDatum, PointDatum, LinkDatum>>): JSX.Element {
  const ref = useRef<VisComponentElement<TopoJSONMap<AreaDatum, PointDatum, LinkDatum>>>(null)
  const [component, setComponent] = useState<TopoJSONMap<AreaDatum, PointDatum, LinkDatum>>()

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<TopoJSONMap<AreaDatum, PointDatum, LinkDatum>>)

    // React 18 in Strict Mode renders components twice. At the same time, a Container that contains this component
    // (e.g. XYContainer) will be updated only after the first render. So we need to make sure that the component will
    // be initialized only once and won't get destroyed after the first render
    const hasAlreadyBeenInitialized = element.__component__
    const c = element.__component__ || new TopoJSONMap<AreaDatum, PointDatum, LinkDatum>(props)
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
export const VisTopoJSONMap: (<AreaDatum, PointDatum, LinkDatum>(props: VisTopoJSONMapProps<AreaDatum, PointDatum, LinkDatum>) => JSX.Element | null) = React.memo(React.forwardRef(VisTopoJSONMapFC), arePropsEqual)
