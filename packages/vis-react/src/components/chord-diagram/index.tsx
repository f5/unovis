// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { ChordDiagram, ChordDiagramConfigInterface, ChordInputNode, ChordInputLink } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisChordDiagramRef<N extends ChordInputNode, L extends ChordInputLink> = {
  component?: ChordDiagram<N, L>;
}

export type VisChordDiagramProps<N extends ChordInputNode, L extends ChordInputLink> = ChordDiagramConfigInterface<N, L> & {
  data?: { nodes: N[]; links?: L[] };
  ref?: Ref<VisChordDiagramRef<N, L>>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisChordDiagramFC<N extends ChordInputNode, L extends ChordInputLink> (props: VisChordDiagramProps<N, L>, fRef: ForwardedRef<VisChordDiagramRef<N, L>>): JSX.Element {
  const ref = useRef<VisComponentElement<ChordDiagram<N, L>>>(null)
  const [component, setComponent] = useState<ChordDiagram<N, L>>()

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<ChordDiagram<N, L>>)

    // React 18 in Strict Mode renders components twice. At the same time, a Container that contains this component
    // (e.g. XYContainer) will be updated only after the first render. So we need to make sure that the component will
    // be initialized only once and won't get destroyed after the first render
    const hasAlreadyBeenInitialized = element.__component__
    const c = element.__component__ || new ChordDiagram<N, L>(props)
    setComponent(c)
    element.__component__ = c

    return () => hasAlreadyBeenInitialized && c.destroy()
  }, [])

  // On Props Update
  useEffect(() => {
    if (props.data) component?.setData(props.data)
    component?.setConfig(props)
  })

  useImperativeHandle(fRef, () => ({ component }), [component])
  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisChordDiagram: (<N extends ChordInputNode, L extends ChordInputLink>(props: VisChordDiagramProps<N, L>) => JSX.Element | null) = React.memo(React.forwardRef(VisChordDiagramFC), arePropsEqual)
