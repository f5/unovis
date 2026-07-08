// !!! This code was automatically generated. You should not change it !!!
import type { GroupedBarConfigInterface } from "@unovis/ts";
import { GroupedBar } from "@unovis/ts";
import { createSignal, onCleanup, createEffect, on, onMount, splitProps } from 'solid-js'
import { arePropsEqual } from '../../utils/props'
import { useVisContainer } from "../../utils/context";

export type VisGroupedBarProps<Datum> = GroupedBarConfigInterface<Datum>& {
  data?: Datum[];
};

export const VisGroupedBarSelectors = GroupedBar.selectors

export function VisGroupedBar<Datum>(props: VisGroupedBarProps<Datum>) {
  const [component, setComponent] = createSignal<GroupedBar<Datum>>()
  // Separate the data prop from the config props, so the dataset doesn't end up in the component config
  const [dataProps, config] = splitProps(props, ['data'])
   const ctx = useVisContainer();
  
  onMount(() => {
    setComponent(new GroupedBar<Datum>(config));
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
