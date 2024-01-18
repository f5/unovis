import React, { ForwardedRef, Ref, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { LeafletFlowMap, LeafletFlowMapConfigInterface } from '@unovis/ts'
import { arePropsEqual } from '../../utils/react'

export const VisLeafletFlowMapSelectors = LeafletFlowMap.selectors

export type VisLeafletFlowMapProps<
  PointDatum extends Record<string, unknown>,
  FlowDatum extends Record<string, unknown>,
> = LeafletFlowMapConfigInterface<PointDatum, FlowDatum> & {
  data?: { points: PointDatum[]; flows: FlowDatum[] };
  ref?: Ref<VisLeafletFlowMapRef<PointDatum, FlowDatum>>;
  className?: string;
}

export type VisLeafletFlowMapRef<
  PointDatum extends Record<string, unknown>,
  FlowDatum extends Record<string, unknown>,
> = {
  component: LeafletFlowMap<PointDatum, FlowDatum> | undefined;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisLeafletFlowMapFC<
  PointDatum extends Record<string, unknown>,
  FlowDatum extends Record<string, unknown>,
> (
  props: VisLeafletFlowMapProps<PointDatum, FlowDatum>,
  ref: ForwardedRef<VisLeafletFlowMapRef<PointDatum, FlowDatum>>
): JSX.Element {
  const container = useRef<HTMLDivElement>(null)
  const [component, setComponent] = useState<LeafletFlowMap<PointDatum, FlowDatum>>()

  // On Mount
  useEffect(() => {
    const c = new LeafletFlowMap(container.current as HTMLDivElement, props, props.data)
    setComponent(c)

    return () => c?.destroy()
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
export const VisLeafletFlowMap: (<
  PointDatum extends Record<string, unknown>,
  FlowDatum extends Record<string, unknown>,
>(props: VisLeafletFlowMapProps<PointDatum, FlowDatum>) => JSX.Element | null) =
  React.memo(React.forwardRef(VisLeafletFlowMapFC), arePropsEqual)
