// !!! This code was automatically generated. You should not change it !!!
import type { CrosshairConfigInterface } from "@unovis/ts";
import { Crosshair } from "@unovis/ts";
import { createSignal, onCleanup, createEffect, on, onMount } from 'solid-js'
import { arePropsEqual } from '../../utils/props'
import { useVisContainer } from "../../utils/context";

export type VisCrosshairProps<Datum> = CrosshairConfigInterface<Datum>& {
  data?: Datum[];
};

export const VisCrosshairSelectors = Crosshair.selectors

export function VisCrosshair<Datum>(props: VisCrosshairProps<Datum>) {
  const [component, setComponent] = createSignal<Crosshair<Datum>>()
   const ctx = useVisContainer();
  
  onMount(() => {
    setComponent(new Crosshair<Datum>(props));
    if (props.data) component()?.setData(props.data)
    ctx.update("crosshair", component);
  })

  onCleanup(() => {
    component()?.destroy()
    ctx.destroy("crosshair");
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

  
  createEffect(
    on(
      () => props.data,
      (data) => {
        if (data) {
          component()?.setData(data)
          ctx.dirty()
        }
      },
      {
        defer: true
      }
    )
  );


  return <div data-vis-crosshair  />
}
