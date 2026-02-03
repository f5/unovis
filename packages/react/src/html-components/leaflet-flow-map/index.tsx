// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { LeafletFlowMap, LeafletFlowMapConfigInterface, GenericDataRecord } from '@unovis/ts'

// Utils
import { arePropsEqual } from '@/utils/react'

// Types
import { VisComponentElement } from '@/types/dom'

export type VisLeafletFlowMapRef<PointDatum extends GenericDataRecord, FlowDatum extends GenericDataRecord> = {
  component?: LeafletFlowMap<PointDatum, FlowDatum>;
}

export type VisLeafletFlowMapProps<PointDatum extends GenericDataRecord, FlowDatum extends GenericDataRecord> = LeafletFlowMapConfigInterface<PointDatum, FlowDatum> & {
  data?: { points: PointDatum[]; flows?: FlowDatum[] };
  ref?: Ref<VisLeafletFlowMapRef<PointDatum, FlowDatum>>;
  className?: string;
}

export const VisLeafletFlowMapSelectors = LeafletFlowMap.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisLeafletFlowMapFC<PointDatum extends GenericDataRecord, FlowDatum extends GenericDataRecord> (props: VisLeafletFlowMapProps<PointDatum, FlowDatum>, fRef: ForwardedRef<VisLeafletFlowMapRef<PointDatum, FlowDatum>>): ReactElement {
  const ref = useRef<VisComponentElement<LeafletFlowMap<PointDatum, FlowDatum>, HTMLDivElement>>(null)
  const componentRef = useRef<LeafletFlowMap<PointDatum, FlowDatum> | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<LeafletFlowMap<PointDatum, FlowDatum>, HTMLDivElement>)

    const c = new LeafletFlowMap<PointDatum, FlowDatum>(ref.current as VisComponentElement<LeafletFlowMap<PointDatum, FlowDatum>, HTMLDivElement>, props, props.data)
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

  useImperativeHandle(fRef, () => ({ get component () { return componentRef.current } }), [])
  return <div className={props.className} ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisLeafletFlowMap: (<PointDatum extends GenericDataRecord, FlowDatum extends GenericDataRecord>(props: VisLeafletFlowMapProps<PointDatum, FlowDatum>) => JSX.Element | null) = React.memo(React.forwardRef(VisLeafletFlowMapFC), arePropsEqual)
