// !!! This code was automatically generated. You should not change it !!!
import type { AxisConfigInterface } from "@unovis/ts";
import { Axis } from "@unovis/ts";
import { createSignal, onCleanup, createEffect, on, onMount } from 'solid-js'
import { arePropsEqual } from '../../utils/props'
import { useVisContainer } from "../../utils/context";

export type VisAxisProps<Datum> = AxisConfigInterface<Datum>& {
  data?: Datum[];
};

export const VisAxisSelectors = Axis.selectors

export function VisAxis<Datum>(props: VisAxisProps<Datum>) {
  const [component, setComponent] = createSignal<Axis<Datum>>()
   const ctx = useVisContainer();
  
  onMount(() => {
    setComponent(new Axis<Datum>(props));
    if (props.data) component()?.setData(props.data)
    ctx.update("axis", component);
  })

  onCleanup(() => {
    component()?.destroy()
    ctx.destroy("axis" ,props.type);
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


  return <div data-vis-axis  />
}
