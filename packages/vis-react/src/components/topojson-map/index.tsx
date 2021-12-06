/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
import { TopoJSONMap, TopoJSONMapConfigInterface } from '@volterra/vis'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { WithSelectors } from 'src/types/react'
import { VisComponentElement } from 'src/types/dom'

export type VisTopoJSONMapProps<AreaDatum, PointDatum, LinkDatum> = TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum> & { data?: any }

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisTopoJSONMapFC<AreaDatum, PointDatum, LinkDatum> (props: VisTopoJSONMapProps<AreaDatum, PointDatum, LinkDatum>): JSX.Element {
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
const memoizedComponent = React.memo(VisTopoJSONMapFC, arePropsEqual)
export const VisTopoJSONMap = memoizedComponent as WithSelectors<typeof memoizedComponent, typeof TopoJSONMap.selectors>
VisTopoJSONMap.selectors = TopoJSONMap.selectors
