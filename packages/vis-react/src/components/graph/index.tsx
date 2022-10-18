// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Graph, GraphConfigInterface, GraphInputNode, GraphInputLink } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisGraphRef<N extends GraphInputNode, L extends GraphInputLink> = {
  component?: Graph<N, L>;
}

export type VisGraphProps<N extends GraphInputNode, L extends GraphInputLink> = GraphConfigInterface<N, L> & {
  data?: any;
  ref?: Ref<VisGraphRef<N, L>>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisGraphFC<N extends GraphInputNode, L extends GraphInputLink> (props: VisGraphProps<N, L>, fRef: ForwardedRef<VisGraphRef<N, L>>): JSX.Element {
  const ref = useRef<VisComponentElement<Graph<N, L>>>(null)
  const [component, setComponent] = useState<Graph<N, L>>()

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Graph<N, L>>)

    const c = new Graph<N, L>(props)
    setComponent(c)
    element.__component__ = c

    return () => c.destroy()
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
export const VisGraph: (<N extends GraphInputNode, L extends GraphInputLink>(props: VisGraphProps<N, L>) => JSX.Element | null) = React.memo(React.forwardRef(VisGraphFC), arePropsEqual)
