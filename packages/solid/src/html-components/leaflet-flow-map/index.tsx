// !!! This code was automatically generated. You should not change it !!!
import type { LeafletFlowMapConfigInterface, GenericDataRecord } from "@unovis/ts";
import { LeafletFlowMap } from "@unovis/ts";
import { createSignal, onCleanup, createEffect, on, onMount, splitProps } from 'solid-js'
import { arePropsEqual } from '../../utils/props'

export type VisLeafletFlowMapProps<PointDatum extends GenericDataRecord, FlowDatum extends GenericDataRecord> = LeafletFlowMapConfigInterface<PointDatum, FlowDatum>& {
  data?: { points: PointDatum[]; flows?: FlowDatum[] };
};

export const VisLeafletFlowMapSelectors = LeafletFlowMap.selectors

export function VisLeafletFlowMap<PointDatum extends GenericDataRecord, FlowDatum extends GenericDataRecord>(props: VisLeafletFlowMapProps<PointDatum, FlowDatum>) {
  const [component, setComponent] = createSignal<LeafletFlowMap<PointDatum, FlowDatum>>()
  // Separate the data prop from the config props, so the dataset doesn't end up in the component config
  const [dataProps, config] = splitProps(props, ['data'])
   
  const [ref, setRef] = createSignal<HTMLDivElement>()

  onMount(() => {
    const r = ref()
    if(r) setComponent(new LeafletFlowMap<PointDatum, FlowDatum>(r, config, dataProps.data));
    
    
  })

  onCleanup(() => {
    component()?.destroy()
    
  })

  createEffect(
    on(
      () => ({ ...config }),
      (curr, prev) => {
        if (!arePropsEqual(prev, curr)) {
          component()?.setConfig(curr)
          
        }
      },
      {
        defer: true
      }
    )
  )

  

  return <div  ref={setRef} style={{ display:"block", position:"relative" }} />
}
