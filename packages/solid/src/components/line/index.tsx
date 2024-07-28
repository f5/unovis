// !!! This code was automatically generated. You should not change it !!!
import type { LineConfigInterface } from "@unovis/ts";
import { Line } from "@unovis/ts";
import { createSignal, onCleanup, createEffect, on, onMount } from 'solid-js'
import { arePropsEqual } from '../../utils/props'
import { useVisContainer } from "../../utils/context";

export type VisLineProps<Datum> = LineConfigInterface<Datum>& {
  data?: Datum[];
};

export const VisLineSelectors = Line.selectors

export function VisLine<Datum>(props: VisLineProps<Datum>) {
  const [component, setComponent] = createSignal<Line<Datum>>()
   const ctx = useVisContainer();
  
  onMount(() => {
    setComponent(new Line<Datum>(props));
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
