/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { useEffect, useRef, useState } from 'react'
// import { Graph, GraphConfigInterface } from '@volterra/vis'
import { Graph, GraphConfigInterface, GraphInputNode, GraphInputLink } from '@volterra/vis'

export type VisGraphProps<N extends GraphInputNode = GraphInputNode, L extends GraphInputLink = GraphInputLink> = GraphConfigInterface<N, L> & { data?: any }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisGraph<N extends GraphInputNode = GraphInputNode, L extends GraphInputLink = GraphInputLink> (props: VisGraphProps<N, L>): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  type RefType = HTMLDivElement & { __component__: Graph<N, L> }
  const ref = useRef<RefType>(null)
  const [component] = useState<Graph<N, L>>(new Graph(props))

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
