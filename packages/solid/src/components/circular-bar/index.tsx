// !!! This code was automatically generated. You should not change it !!!
import { CircularBar } from "@unovis/ts/components/circular-bar";
import type { CircularBarConfigInterface } from "@unovis/ts/components/circular-bar/config";
import { createSignal, onCleanup, createEffect, on, onMount, splitProps } from 'solid-js'
import { arePropsEqual } from '../../utils/props'
import { useVisContainer } from "../../utils/context";

export type VisCircularBarProps<Datum> = CircularBarConfigInterface<Datum>& {
  data?: Datum[];
};

export const VisCircularBarSelectors = CircularBar.selectors

export function VisCircularBar<Datum>(props: VisCircularBarProps<Datum>) {
  const [component, setComponent] = createSignal<CircularBar<Datum>>()
  // Separate the data prop from the config props, so the dataset doesn't end up in the component config
  const [dataProps, config] = splitProps(props, ['data'])
   const ctx = useVisContainer();
  
  onMount(() => {
    setComponent(new CircularBar<Datum>(config));
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
