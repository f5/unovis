// !!! This code was automatically generated. You should not change it !!!
import { RollingPinLegend } from "@unovis/ts/components/rolling-pin-legend";
import type { RollingPinLegendConfigInterface } from "@unovis/ts/components/rolling-pin-legend/config";
import { createSignal, onCleanup, createEffect, on, onMount } from 'solid-js'
import { arePropsEqual } from '../../utils/props'

export type VisRollingPinLegendProps = RollingPinLegendConfigInterface

export const VisRollingPinLegendSelectors = RollingPinLegend.selectors

export function VisRollingPinLegend(props: VisRollingPinLegendProps) {
  const [component, setComponent] = createSignal<RollingPinLegend>()
   
  const [ref, setRef] = createSignal<HTMLDivElement>()

  onMount(() => {
    const r = ref()
    if(r) setComponent(new RollingPinLegend(r, props));
    
    
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
