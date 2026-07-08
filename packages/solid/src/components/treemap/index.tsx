// !!! This code was automatically generated. You should not change it !!!
import type { TreemapConfigInterface } from "@unovis/ts";
import { Treemap } from "@unovis/ts";
import { createSignal, onCleanup, createEffect, on, onMount, splitProps } from 'solid-js'
import { arePropsEqual } from '../../utils/props'
import { useVisContainer } from "../../utils/context";

export type VisTreemapProps<Datum> = TreemapConfigInterface<Datum>& {
  data?: Datum[];
};

export const VisTreemapSelectors = Treemap.selectors

export function VisTreemap<Datum>(props: VisTreemapProps<Datum>) {
  const [component, setComponent] = createSignal<Treemap<Datum>>()
  // Separate the data prop from the config props, so the dataset doesn't end up in the component config
  const [dataProps, config] = splitProps(props, ['data'])
   const ctx = useVisContainer();
  
  onMount(() => {
    setComponent(new Treemap<Datum>(config));
    if (dataProps.data) component()?.setData(dataProps.data)
    ctx.update("component", component);
  })

  onCleanup(() => {
    component()?.destroy()
    ctx.destroy("component");
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
