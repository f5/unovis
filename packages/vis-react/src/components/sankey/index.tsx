// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef } from 'react'
import { Sankey, SankeyConfigInterface, SankeyInputNode, SankeyInputLink } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisSankeyRef<N extends SankeyInputNode, L extends SankeyInputLink> = {
  component: Sankey<N, L>;
}

export type VisSankeyProps<N extends SankeyInputNode, L extends SankeyInputLink> = SankeyConfigInterface<N, L> & {
  data?: any;
  ref?: Ref<VisSankeyRef<N, L>>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisSankeyFC<N extends SankeyInputNode, L extends SankeyInputLink> (props: VisSankeyProps<N, L>, fRef: ForwardedRef<VisSankeyRef<N, L>>): JSX.Element {
  const ref = useRef<VisComponentElement<Sankey<N, L>>>(null)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Sankey<N, L>>)
    element.__component__?.destroy() // Destroy component if exists already (to comply with React 18 strict mode, which renders components twice in dev mode)
    element.__component__ = new Sankey(props)
    // We don't have a clean up function because the component will be destroyed by its container (e.g. XYContainer or SingleContainer)
  }, [])

  // On Props Update
  useEffect(() => {
    const component = (ref.current as VisComponentElement<Sankey<N, L>>).__component__
    if (props.data) component?.setData(props.data)
    component?.setConfig(props)
  })

  useImperativeHandle(fRef, () => ({ component: (ref.current as VisComponentElement<Sankey<N, L>>).__component__ }))
  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisSankey: (<N extends SankeyInputNode, L extends SankeyInputLink>(props: VisSankeyProps<N, L>) => JSX.Element | null) = React.memo(React.forwardRef(VisSankeyFC), arePropsEqual)
