// !!! This code was automatically generated. You should not change it !!!
import type { BulletLegendConfigInterface } from "@unovis/ts";
import { BulletLegend } from "@unovis/ts";
import { createSignal, onCleanup, createEffect, on, onMount } from 'solid-js'
import { arePropsEqual } from '../../utils/props'

export type VisBulletLegendProps = BulletLegendConfigInterface

export const VisBulletLegendSelectors = BulletLegend.selectors

export function VisBulletLegend(props: VisBulletLegendProps) {
  const [component, setComponent] = createSignal<BulletLegend>()
  const config = props
   
  const [ref, setRef] = createSignal<HTMLDivElement>()

  onMount(() => {
    const r = ref()
    if(r) setComponent(new BulletLegend(r, { ...config, renderIntoProvidedDomNode: true }));
    
    
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

  

  return <div  ref={setRef} style={{ display:"block" }} />
}
