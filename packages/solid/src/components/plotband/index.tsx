// !!! This code was automatically generated. You should not change it !!!
import type { PlotbandConfigInterface } from "@unovis/ts";
import { Plotband } from "@unovis/ts";
import { createSignal, onCleanup, createEffect, on, onMount } from 'solid-js'
import { arePropsEqual } from '../../utils/props'
import { useVisContainer } from "../../utils/context";

export type VisPlotbandProps<Datum> = PlotbandConfigInterface<Datum>

export const VisPlotbandSelectors = Plotband.selectors

export function VisPlotband<Datum>(props: VisPlotbandProps<Datum>) {
  const [component, setComponent] = createSignal<Plotband<Datum>>()
   const ctx = useVisContainer();
  
  onMount(() => {
    setComponent(new Plotband<Datum>(props));
    
    ctx.update("component", component);
  })

  onCleanup(() => {
    component()?.destroy()
    ctx.destroy("component");
  })

  createEffect(
    on(
      () => ({ ...props }),
      (curr, prev) => {
        if (!arePropsEqual(prev, curr)) {
          component()?.setConfig(curr)
          ctx.dirty()
        }
      },
      {
        defer: true
      }
    )
  )

  

  return <div data-vis-component  />
}
