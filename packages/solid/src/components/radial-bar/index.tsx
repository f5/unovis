// !!! This code was automatically generated. You should not change it !!!
import type { RadialBarConfigInterface } from "@unovis/ts";
import { RadialBar } from "@unovis/ts";
import { createSignal, onCleanup, createEffect, on, onMount } from 'solid-js'
import { arePropsEqual } from '../../utils/props'
import { useVisContainer } from "../../utils/context";

export type VisRadialBarProps<Datum> = RadialBarConfigInterface<Datum>& {
  data?: Datum[];
};

export const VisRadialBarSelectors = RadialBar.selectors

export function VisRadialBar<Datum>(props: VisRadialBarProps<Datum>) {
  const [component, setComponent] = createSignal<RadialBar<Datum>>()
   const ctx = useVisContainer();
  
  onMount(() => {
    setComponent(new RadialBar<Datum>(props));
    if (props.data) component()?.setData(props.data)
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


  return <div data-vis-component  />
}
