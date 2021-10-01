/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { useEffect, useRef, useState } from 'react'
// import { TopoJSONMap, TopoJSONMapConfigInterface } from '@volterra/vis'
import { TopoJSONMap, TopoJSONMapConfigInterface, MapInputNode, MapInputLink, MapInputArea } from '@volterra/vis'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisTopoJSONMapProps<N extends MapInputNode, L extends MapInputLink = MapInputLink, A extends MapInputArea = MapInputArea> = TopoJSONMapConfigInterface<N, L, A> & { data?: any }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisTopoJSONMap<N extends MapInputNode, L extends MapInputLink = MapInputLink, A extends MapInputArea = MapInputArea> (props: VisTopoJSONMapProps<N, L, A>): JSX.Element {
  const ref = useRef<VisComponentElement<TopoJSONMap<N, L, A>>>(null)
  const [component] = useState<TopoJSONMap<N, L, A>>(new TopoJSONMap(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<TopoJSONMap<N, L, A>>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setData(props.data ?? [])
    component?.setConfig(props)
  })

  return <vis-component ref={ref} />
}
