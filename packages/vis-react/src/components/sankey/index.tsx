/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { useEffect, useRef, useState } from 'react'
// import { Sankey, SankeyConfigInterface } from '@volterra/vis'
import { Sankey, SankeyConfigInterface, SankeyInputNode, SankeyInputLink } from '@volterra/vis'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisSankeyProps<N extends SankeyInputNode, L extends SankeyInputLink> = SankeyConfigInterface<N, L> & { data?: any }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisSankey<N extends SankeyInputNode, L extends SankeyInputLink> (props: VisSankeyProps<N, L>): JSX.Element {
  const ref = useRef<VisComponentElement<Sankey<N, L>>>(null)
  const [component] = useState<Sankey<N, L>>(new Sankey(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<Sankey<N, L>>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setData(props.data ?? [])
    component?.setConfig(props)
  })

  return <vis-component ref={ref} />
}
