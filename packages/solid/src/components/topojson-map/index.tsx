// !!! This code was automatically generated. You should not change it !!!
import type { TopoJSONMapConfigInterface, GenericDataRecord } from "@unovis/ts";
import { TopoJSONMap } from "@unovis/ts";
import { createSignal, onCleanup, createEffect, on, onMount } from 'solid-js'
import { arePropsEqual } from '../../utils/props'
import { useVisContainer } from "../../utils/context";

export type VisTopoJSONMapProps<AreaDatum, PointDatum extends GenericDataRecord, LinkDatum> = TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum>& {
  data?: {areas?: AreaDatum[]; points?: PointDatum[]; links?: LinkDatum[]};
};

export const VisTopoJSONMapSelectors = TopoJSONMap.selectors

export function VisTopoJSONMap<AreaDatum, PointDatum extends GenericDataRecord, LinkDatum>(props: VisTopoJSONMapProps<AreaDatum, PointDatum, LinkDatum>) {
  const [component, setComponent] = createSignal<TopoJSONMap<AreaDatum, PointDatum, LinkDatum>>()
   const ctx = useVisContainer();
  
  onMount(() => {
    setComponent(new TopoJSONMap<AreaDatum, PointDatum, LinkDatum>(props));
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
