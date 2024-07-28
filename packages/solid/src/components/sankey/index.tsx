// !!! This code was automatically generated. You should not change it !!!
import type { SankeyConfigInterface, SankeyInputNode, SankeyInputLink } from "@unovis/ts";
import { Sankey } from "@unovis/ts";
import { createSignal, onCleanup, createEffect, on, onMount } from 'solid-js'
import { arePropsEqual } from '../../utils/props'
import { useVisContainer } from "../../utils/context";

export type VisSankeyProps<N extends SankeyInputNode, L extends SankeyInputLink> = SankeyConfigInterface<N, L>& {
  data?: { nodes: N[]; links?: L[] };
};

export const VisSankeySelectors = Sankey.selectors

export function VisSankey<N extends SankeyInputNode, L extends SankeyInputLink>(props: VisSankeyProps<N, L>) {
  const [component, setComponent] = createSignal<Sankey<N, L>>()
   const ctx = useVisContainer();
  
  onMount(() => {
    setComponent(new Sankey<N, L>(props));
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
