// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { LeafletFlowMap, LeafletFlowMapConfigInterface, GenericDataRecord } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

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
function VisLeafletFlowMapFC<PointDatum extends GenericDataRecord, FlowDatum extends GenericDataRecord> (props: VisLeafletFlowMapProps<PointDatum, FlowDatum>, fRef: ForwardedRef<VisLeafletFlowMapRef<PointDatum, FlowDatum>>): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  const [component, setComponent] = useState<LeafletFlowMap<PointDatum, FlowDatum>>()

  // On Mount
  useEffect(() => {
    const c = new LeafletFlowMap<PointDatum, FlowDatum>(ref.current as HTMLDivElement, props, props.data)
    setComponent(c)

    return () => c?.destroy()
  }, [])

  // On Props Update
  useEffect(() => {
    if (props.data) component?.setData(props.data)
    component?.setConfig(props)
  })

  useImperativeHandle(fRef, () => ({ get component () { return component } }), [component])
  return <div className={props.className} ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisLeafletFlowMap: (<PointDatum extends GenericDataRecord, FlowDatum extends GenericDataRecord>(props: VisLeafletFlowMapProps<PointDatum, FlowDatum>) => JSX.Element | null) = React.memo(React.forwardRef(VisLeafletFlowMapFC), arePropsEqual)
