// !!! This code was automatically generated. You should not change it !!!
import type { LeafletMapConfigInterface, GenericDataRecord } from "@unovis/ts";
import { LeafletMap } from "@unovis/ts";
import { createSignal, onCleanup, createEffect, on, onMount, splitProps } from 'solid-js'
import { arePropsEqual } from '../../utils/props'

export type VisLeafletMapProps<Datum extends GenericDataRecord> = LeafletMapConfigInterface<Datum>& {
  data?: Datum[];
};

export const VisLeafletMapSelectors = LeafletMap.selectors

export function VisLeafletMap<Datum extends GenericDataRecord>(props: VisLeafletMapProps<Datum>) {
  const [component, setComponent] = createSignal<LeafletMap<Datum>>()
  // Separate the data prop from the config props, so the dataset doesn't end up in the component config
  const [dataProps, config] = splitProps(props, ['data'])
   
  const [ref, setRef] = createSignal<HTMLDivElement>()

  onMount(() => {
    const r = ref()
    if(r) setComponent(new LeafletMap<Datum>(r, config, dataProps.data));
    
    
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
