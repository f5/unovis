// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { TopoJSONMap, TopoJSONMapConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisTopoJSONMapRef<AreaDatum, PointDatum, LinkDatum> = {
  component: TopoJSONMap<AreaDatum, PointDatum, LinkDatum>;
}

export type VisTopoJSONMapProps<AreaDatum, PointDatum, LinkDatum> = TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum> & {
  data?: {areas?: AreaDatum[]; points?: PointDatum[]; links?: LinkDatum[]};
  ref?: Ref<VisTopoJSONMapRef<AreaDatum, PointDatum, LinkDatum>>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisTopoJSONMapFC<AreaDatum, PointDatum, LinkDatum> (props: VisTopoJSONMapProps<AreaDatum, PointDatum, LinkDatum>, fRef: ForwardedRef<VisTopoJSONMapRef<AreaDatum, PointDatum, LinkDatum>>): JSX.Element {
  const ref = useRef<VisComponentElement<TopoJSONMap<AreaDatum, PointDatum, LinkDatum>>>(null)
  const [component] = useState<TopoJSONMap<AreaDatum, PointDatum, LinkDatum>>(new TopoJSONMap(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<TopoJSONMap<AreaDatum, PointDatum, LinkDatum>>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    if (props.data) component?.setData(props.data)
    component?.setConfig(props)
  })

  useImperativeHandle(fRef, () => ({ component }))
  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisTopoJSONMap: (<AreaDatum, PointDatum, LinkDatum>(props: VisTopoJSONMapProps<AreaDatum, PointDatum, LinkDatum>) => JSX.Element | null) = React.memo(React.forwardRef(VisTopoJSONMapFC), arePropsEqual)
