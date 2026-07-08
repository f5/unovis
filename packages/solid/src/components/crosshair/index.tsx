// !!! This code was automatically generated. You should not change it !!!
import type { CrosshairConfigInterface } from "@unovis/ts";
import { Crosshair } from "@unovis/ts";
import { createSignal, onCleanup, createEffect, on, onMount, splitProps } from 'solid-js'
import { arePropsEqual } from '../../utils/props'
import { useVisContainer } from "../../utils/context";

export type VisCrosshairProps<Datum> = CrosshairConfigInterface<Datum>& {
  data?: Datum[];
};

export const VisCrosshairSelectors = Crosshair.selectors

export function VisCrosshair<Datum>(props: VisCrosshairProps<Datum>) {
  const [component, setComponent] = createSignal<Crosshair<Datum>>()
  // Separate the data prop from the config props, so the dataset doesn't end up in the component config
  const [dataProps, config] = splitProps(props, ['data'])
   const ctx = useVisContainer();
  
  onMount(() => {
    setComponent(new Crosshair<Datum>(config));
    if (dataProps.data !== undefined) component()?.setData(dataProps.data)
    ctx.update("crosshair", component);
  })

  onCleanup(() => {
    component()?.destroy()
    ctx.destroy("crosshair");
  })

  createEffect(
    on(
      () => ({ ...config }),
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
      () => dataProps.data,
      (data) => {
        if (data !== undefined) {
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
