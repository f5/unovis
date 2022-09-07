import React, { ForwardedRef, Ref, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { LeafletFlowMap, LeafletFlowMapConfigInterface } from '@unovis/ts'
import { arePropsEqual } from '../../utils/react'

export type VisLeafletFlowMapProps<PointDatum, FlowDatum> = LeafletFlowMapConfigInterface<PointDatum, FlowDatum> & {
  data?: { points: PointDatum[]; flows: FlowDatum[] };
  ref?: Ref<VisLeafletFlowMapRef<PointDatum, FlowDatum>>;
  className?: string;
}

export type VisLeafletFlowMapRef<PointDatum, FlowDatum> = {
  component: LeafletFlowMap<PointDatum, FlowDatum> | undefined;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisLeafletFlowMapFC<PointDatum, FlowDatum> (
  props: VisLeafletFlowMapProps<PointDatum, FlowDatum>,
  ref: ForwardedRef<VisLeafletFlowMapRef<PointDatum, FlowDatum>>
): JSX.Element {
  const container = useRef<HTMLDivElement>(null)
  const [component, setComponent] = useState<LeafletFlowMap<PointDatum, FlowDatum>>()

  // On Mount
  useEffect(() => {
    setComponent(
      new LeafletFlowMap(container.current as HTMLDivElement, props, props.data)
    )

    return () => component?.destroy()
  }, [])

  // On Props Update
  useEffect(() => {
    if (props.data) component?.setData(props.data)

    component?.setConfig(props)
  })

  useImperativeHandle(ref, () => ({ component }))
  return <div ref={container} className={props.className} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisLeafletFlowMap: (<PointDatum, FlowDatum>(props: VisLeafletFlowMapProps<PointDatum, FlowDatum>) => JSX.Element | null) =
  React.memo(React.forwardRef(VisLeafletFlowMapFC), arePropsEqual)
