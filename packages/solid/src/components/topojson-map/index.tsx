// !!! This code was automatically generated. You should not change it !!!
import type { TopoJSONMapConfigInterface } from "@unovis/ts";
import { TopoJSONMap } from "@unovis/ts";
import { createSignal, onCleanup, createEffect, on, onMount, splitProps } from 'solid-js'
import { arePropsEqual } from '../../utils/props'
import { useVisContainer } from "../../utils/context";

export type VisTopoJSONMapProps<AreaDatum, PointDatum, LinkDatum> = TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum>& {
  data?: {areas?: AreaDatum[]; points?: PointDatum[]; links?: LinkDatum[]};
};

export const VisTopoJSONMapSelectors = TopoJSONMap.selectors

export function VisTopoJSONMap<AreaDatum, PointDatum, LinkDatum>(props: VisTopoJSONMapProps<AreaDatum, PointDatum, LinkDatum>) {
  const [component, setComponent] = createSignal<TopoJSONMap<AreaDatum, PointDatum, LinkDatum>>()
  // Separate the data prop from the config props, so the dataset doesn't end up in the component config
  const [dataProps, config] = splitProps(props, ['data'])
   const ctx = useVisContainer();
  
  onMount(() => {
    setComponent(new TopoJSONMap<AreaDatum, PointDatum, LinkDatum>(config));
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
