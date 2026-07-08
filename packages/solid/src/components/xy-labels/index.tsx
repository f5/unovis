// !!! This code was automatically generated. You should not change it !!!
import type { XYLabelsConfigInterface } from "@unovis/ts";
import { XYLabels } from "@unovis/ts";
import { createSignal, onCleanup, createEffect, on, onMount, splitProps } from 'solid-js'
import { arePropsEqual } from '../../utils/props'
import { useVisContainer } from "../../utils/context";

export type VisXYLabelsProps<Datum> = XYLabelsConfigInterface<Datum>& {
  data?: Datum[];
};

export const VisXYLabelsSelectors = XYLabels.selectors

export function VisXYLabels<Datum>(props: VisXYLabelsProps<Datum>) {
  const [component, setComponent] = createSignal<XYLabels<Datum>>()
  // Separate the data prop from the config props, so the dataset doesn't end up in the component config
  const [dataProps, config] = splitProps(props, ['data'])
   const ctx = useVisContainer();
  
  onMount(() => {
    setComponent(new XYLabels<Datum>(config));
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
