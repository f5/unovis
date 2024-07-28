// !!! This code was automatically generated. You should not change it !!!
import type { StackedBarConfigInterface } from "@unovis/ts";
import { StackedBar } from "@unovis/ts";
import { createSignal, onCleanup, createEffect, on, onMount } from 'solid-js'
import { arePropsEqual } from '../../utils/props'
import { useVisContainer } from "../../utils/context";

export type VisStackedBarProps<Datum> = StackedBarConfigInterface<Datum>& {
  data?: Datum[];
};

export const VisStackedBarSelectors = StackedBar.selectors

export function VisStackedBar<Datum>(props: VisStackedBarProps<Datum>) {
  const [component, setComponent] = createSignal<StackedBar<Datum>>()
   const ctx = useVisContainer();
  
  onMount(() => {
    setComponent(new StackedBar<Datum>(props));
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
