/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { useEffect, useRef, useState } from 'react'
// import { Sankey, SankeyConfigInterface } from '@volterra/vis'
import { Sankey, SankeyConfigInterface, SankeyInputNode, SankeyInputLink } from '@volterra/vis'

export type VisSankeyProps<N extends SankeyInputNode = SankeyInputNode, L extends SankeyInputLink = SankeyInputLink> = SankeyConfigInterface<N, L> & { data?: any }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisSankey<N extends SankeyInputNode = SankeyInputNode, L extends SankeyInputLink = SankeyInputLink> (props: VisSankeyProps<N, L>): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  type RefType = HTMLDivElement & { __component__: Sankey<N, L> }
  const ref = useRef<RefType>(null)
  const [component] = useState<Sankey<N, L>>(new Sankey(props))

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
