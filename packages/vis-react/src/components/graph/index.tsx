/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
import { Graph, GraphConfigInterface, GraphInputNode, GraphInputLink } from '@volterra/vis'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisGraphProps<N extends GraphInputNode, L extends GraphInputLink> = GraphConfigInterface<N, L> & { data?: any }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisGraph<N extends GraphInputNode, L extends GraphInputLink> (props: VisGraphProps<N, L>): JSX.Element {
  const ref = useRef<VisComponentElement<Graph<N, L>>>(null)
  const [component] = useState<Graph<N, L>>(new Graph(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<Graph<N, L>>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setData(props.data ?? [])
    component?.setConfig(props)
  })

  return <vis-component ref={ref} />
}
VisGraph.selectors = Graph.selectors
