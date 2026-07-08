// !!! This code was automatically generated. You should not change it !!!
import type { RollingPinLegendConfigInterface } from "@unovis/ts";
import { RollingPinLegend } from "@unovis/ts";
import { createSignal, onCleanup, createEffect, on, onMount } from 'solid-js'
import { arePropsEqual } from '../../utils/props'

export type VisRollingPinLegendProps = RollingPinLegendConfigInterface

export const VisRollingPinLegendSelectors = RollingPinLegend.selectors

export function VisRollingPinLegend(props: VisRollingPinLegendProps) {
  const [component, setComponent] = createSignal<RollingPinLegend>()
  const config = props
   
  const [ref, setRef] = createSignal<HTMLDivElement>()

  onMount(() => {
    const r = ref()
    if(r) setComponent(new RollingPinLegend(r, config));
    
    
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

  

  return <div data-vis-component ref={setRef} style={{ display:"block" }} />
}
