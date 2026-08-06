// !!! This code was automatically generated. You should not change it !!!
import { Plotline } from "@unovis/ts/components/plotline";
import type { PlotlineConfigInterface } from "@unovis/ts/components/plotline/config";
import { createSignal, onCleanup, createEffect, on, onMount } from 'solid-js'
import { arePropsEqual } from '../../utils/props'
import { useVisContainer } from "../../utils/context";

export type VisPlotlineProps<Datum> = PlotlineConfigInterface<Datum>

export const VisPlotlineSelectors = Plotline.selectors

export function VisPlotline<Datum>(props: VisPlotlineProps<Datum>) {
  const [component, setComponent] = createSignal<Plotline<Datum>>()
   const ctx = useVisContainer();
  
  onMount(() => {
    setComponent(new Plotline<Datum>(props));
    
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
