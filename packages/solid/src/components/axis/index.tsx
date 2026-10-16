// !!! This code was automatically generated. You should not change it !!!
import type { AxisConfigInterface } from "@unovis/ts";
import { Axis } from "@unovis/ts";
import { createSignal, onCleanup, createEffect, on, onMount, splitProps } from 'solid-js'
import { arePropsEqual } from '../../utils/props'
import { useVisContainer } from "../../utils/context";

export type VisAxisProps<Datum> = AxisConfigInterface<Datum>& {
  data?: Datum[];
};

export const VisAxisSelectors = Axis.selectors

export function VisAxis<Datum>(props: VisAxisProps<Datum>) {
  const [component, setComponent] = createSignal<Axis<Datum>>()
  // Separate the data prop from the config props, so the dataset doesn't end up in the component config
  const [dataProps, config] = splitProps(props, ['data'])
   const ctx = useVisContainer();
  
  onMount(() => {
    setComponent(new Axis<Datum>(config));
    if (dataProps.data !== undefined) component()?.setData(dataProps.data)
    ctx.update("axis", component);
  })

  onCleanup(() => {
    component()?.destroy()
    ctx.destroy("axis" ,props.type);
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


  return <div data-vis-axis  />
}
