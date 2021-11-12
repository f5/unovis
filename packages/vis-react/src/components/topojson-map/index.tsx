/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
import { TopoJSONMap, TopoJSONMapConfigInterface } from '@volterra/vis'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisTopoJSONMapProps<AreaDatum, PointDatum, LinkDatum> = TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum> & { data?: any }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisTopoJSONMap<AreaDatum, PointDatum, LinkDatum> (props: VisTopoJSONMapProps<AreaDatum, PointDatum, LinkDatum>): JSX.Element {
  const ref = useRef<VisComponentElement<TopoJSONMap<AreaDatum, PointDatum, LinkDatum>>>(null)
  const [component] = useState<TopoJSONMap<AreaDatum, PointDatum, LinkDatum>>(new TopoJSONMap(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<TopoJSONMap<AreaDatum, PointDatum, LinkDatum>>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setData(props.data ?? [])
    component?.setConfig(props)
  })

  return <vis-component ref={ref} />
}
VisTopoJSONMap.selectors = TopoJSONMap.selectors
