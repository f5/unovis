// !!! This code was automatically generated. You should not change it !!!
import { Zoom } from "@unovis/ts/components/zoom";
import type { ZoomConfigInterface } from "@unovis/ts/components/zoom/config";
import { createSignal, onCleanup, createEffect, on, onMount, splitProps } from 'solid-js'
import { arePropsEqual } from '../../utils/props'
import { useVisContainer } from "../../utils/context";

export type VisZoomProps<Datum> = ZoomConfigInterface<Datum>& {
  data?: Datum[];
};

export const VisZoomSelectors = Zoom.selectors

export function VisZoom<Datum>(props: VisZoomProps<Datum>) {
  const [component, setComponent] = createSignal<Zoom<Datum>>()
  // Separate the data prop from the config props, so the dataset doesn't end up in the component config
  const [dataProps, config] = splitProps(props, ['data'])
   const ctx = useVisContainer();
  
  onMount(() => {
    setComponent(new Zoom<Datum>(config));
    if (dataProps.data !== undefined) component()?.setData(dataProps.data)
    ctx.update("zoom", component);
  })

  onCleanup(() => {
    component()?.destroy()
    ctx.destroy("zoom");
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


  return <div data-vis-zoom  />
}
