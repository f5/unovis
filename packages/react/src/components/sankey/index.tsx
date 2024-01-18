// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Sankey, SankeyConfigInterface, SankeyInputNode, SankeyInputLink } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisSankeyRef<N extends SankeyInputNode, L extends SankeyInputLink> = {
  component?: Sankey<N, L>;
}

export type VisSankeyProps<N extends SankeyInputNode, L extends SankeyInputLink> = SankeyConfigInterface<N, L> & {
  data?: { nodes: N[]; links?: L[] };
  ref?: Ref<VisSankeyRef<N, L>>;
}

export const VisSankeySelectors = Sankey.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisSankeyFC<N extends SankeyInputNode, L extends SankeyInputLink> (props: VisSankeyProps<N, L>, fRef: ForwardedRef<VisSankeyRef<N, L>>): JSX.Element {
  const ref = useRef<VisComponentElement<Sankey<N, L>>>(null)
  const componentRef = useRef<Sankey<N, L> | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Sankey<N, L>>)

    const c = new Sankey<N, L>(props)
    componentRef.current = c
    element.__component__ = c

    return () => {
      componentRef.current = undefined
      c.destroy()
    }
  }, [])

  // On Props Update
  useEffect(() => {
    const component = componentRef.current
    if (props.data) component?.setData(props.data)
    component?.setConfig(props)
  })

  useImperativeHandle(fRef, () => ({ component: componentRef.current }), [componentRef.current])
  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisSankey: (<N extends SankeyInputNode, L extends SankeyInputLink>(props: VisSankeyProps<N, L>) => JSX.Element | null) = React.memo(React.forwardRef(VisSankeyFC), arePropsEqual)
