// !!! This code was automatically generated. You should not change it !!!
import type { FlowLegendConfigInterface } from "@unovis/ts";
import { FlowLegend } from "@unovis/ts";
import { createSignal, onCleanup, createEffect, on, onMount } from 'solid-js'
import { arePropsEqual } from '../../utils/props'

export type VisFlowLegendProps = FlowLegendConfigInterface

export const VisFlowLegendSelectors = FlowLegend.selectors

export function VisFlowLegend(props: VisFlowLegendProps) {
  const [component, setComponent] = createSignal<FlowLegend>()
   
  const [ref, setRef] = createSignal<HTMLDivElement>()

  onMount(() => {
    const r = ref()
    if(r) setComponent(new FlowLegend(r, { ...props, renderIntoProvidedDomNode: true }));
    
    
  })

  onCleanup(() => {
    component()?.destroy()
    
  })

  createEffect(
    on(
      () => ({ ...props }),
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

  

  return <div data-vis-component ref={setRef} style={{ display:"block" }} />
}
