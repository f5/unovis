// !!! This code was automatically generated. You should not change it !!!
import type { GraphConfigInterface, GraphInputNode, GraphInputLink } from "@unovis/ts";
import { Graph } from "@unovis/ts";
import { createSignal, onCleanup, createEffect, on, onMount } from 'solid-js'
import { arePropsEqual } from '../../utils/props'
import { useVisContainer } from "../../utils/context";

export type VisGraphProps<N extends GraphInputNode, L extends GraphInputLink> = GraphConfigInterface<N, L>& {
  data?: { nodes: N[]; links?: L[] };
};

export const VisGraphSelectors = Graph.selectors

export function VisGraph<N extends GraphInputNode, L extends GraphInputLink>(props: VisGraphProps<N, L>) {
  const [component, setComponent] = createSignal<Graph<N, L>>()
   const ctx = useVisContainer();
  
  onMount(() => {
    setComponent(new Graph<N, L>(props));
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
