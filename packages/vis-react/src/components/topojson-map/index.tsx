/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { useEffect, useRef, useState } from 'react'
// import { TopoJSONMap, TopoJSONMapConfigInterface } from '@volterra/vis'
import { TopoJSONMap, TopoJSONMapConfigInterface, MapInputNode, MapInputLink, MapInputArea } from '@volterra/vis'

export type VisTopoJSONMapProps<N extends MapInputNode = MapInputNode, L extends MapInputLink = MapInputLink, A extends MapInputArea = MapInputArea> = TopoJSONMapConfigInterface<N, L, A> & { data?: any }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisTopoJSONMap<N extends MapInputNode = MapInputNode, L extends MapInputLink = MapInputLink, A extends MapInputArea = MapInputArea> (props: VisTopoJSONMapProps<N, L, A>): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  type RefType = HTMLDivElement & { __component__: TopoJSONMap<N, L, A> }
  const ref = useRef<RefType>(null)
  const [component] = useState<TopoJSONMap<N, L, A>>(new TopoJSONMap(props))

  // On Mount
  useEffect(() => {
    (ref.current as RefType).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setData(props.data ?? [])
    component?.setConfig(props)
  })

  return <vis-component ref={ref} />
}
