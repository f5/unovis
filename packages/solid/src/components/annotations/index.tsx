// !!! This code was automatically generated. You should not change it !!!
import type { AnnotationsConfigInterface } from "@unovis/ts";
import { Annotations } from "@unovis/ts";
import { createSignal, onCleanup, createEffect, on, onMount } from 'solid-js'
import { arePropsEqual } from '../../utils/props'
import { useVisContainer } from "../../utils/context";

export type VisAnnotationsProps = AnnotationsConfigInterface

export const VisAnnotationsSelectors = Annotations.selectors

export function VisAnnotations(props: VisAnnotationsProps) {
  const [component, setComponent] = createSignal<Annotations>()
   const ctx = useVisContainer();
  
  onMount(() => {
    setComponent(new Annotations(props));
    
    ctx.update("annotations", component);
  })

  onCleanup(() => {
    component()?.destroy()
    ctx.destroy("annotations");
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

  

  return <div data-vis-annotations  />
}
