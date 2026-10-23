// !!! This code was automatically generated. You should not change it !!!
import { Heatmap } from "@unovis/ts/components/heatmap";
import type { HeatmapConfigInterface } from "@unovis/ts/components/heatmap/config";
import { createSignal, onCleanup, createEffect, on, onMount, splitProps } from 'solid-js'
import { arePropsEqual } from '../../utils/props'
import { useVisContainer } from "../../utils/context";

export type VisHeatmapProps<Datum> = HeatmapConfigInterface<Datum>& {
  data?: Datum[];
};

export const VisHeatmapSelectors = Heatmap.selectors

export function VisHeatmap<Datum>(props: VisHeatmapProps<Datum>) {
  const [component, setComponent] = createSignal<Heatmap<Datum>>()
  // Separate the data prop from the config props, so the dataset doesn't end up in the component config
  const [dataProps, config] = splitProps(props, ['data'])
   const ctx = useVisContainer();
  
  onMount(() => {
    setComponent(new Heatmap<Datum>(config));
    if (dataProps.data !== undefined) component()?.setData(dataProps.data)
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


  return <div data-vis-component  />
}
