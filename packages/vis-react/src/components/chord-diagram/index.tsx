// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
import { ChordDiagram, ChordDiagramConfigInterface, ChordInputNode, ChordInputLink } from '@volterra/vis'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisChordDiagramProps<N extends ChordInputNode, L extends ChordInputLink> = ChordDiagramConfigInterface<N, L> & { data?: { nodes: N[]; links?: L[] } }

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisChordDiagramFC<N extends ChordInputNode, L extends ChordInputLink> (props: VisChordDiagramProps<N, L>): JSX.Element {
  const ref = useRef<VisComponentElement<ChordDiagram<N, L>>>(null)
  const [component] = useState<ChordDiagram<N, L>>(new ChordDiagram(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<ChordDiagram<N, L>>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    if (props.data) component?.setData(props.data)
    component?.setConfig(props)
  })

  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisChordDiagram: (<N extends ChordInputNode, L extends ChordInputLink>(props: VisChordDiagramProps<N, L>) => JSX.Element | null) = React.memo(VisChordDiagramFC, arePropsEqual)
