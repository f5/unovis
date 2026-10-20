<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Graph as GraphCore } from '@unovis/ts/components/graph'
  import type { GraphConfigInterface } from '@unovis/ts/components/graph/config'
  import type { GraphInputNode, GraphInputLink } from '@unovis/ts/types/graph'
  import { cloneDeep } from '@unovis/ts/utils/data'
  import { onMount, getContext } from 'svelte'

  import type { Lifecycle } from '../../types/context'
  import { arePropsEqual } from '../../utils/props'
  // type defs
  type N = $$Generic<GraphInputNode>
  type L = $$Generic<GraphInputLink>

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: { nodes: N[]; links?: L[] } = undefined

  // config
  let prevConfig: GraphConfigInterface<N, L>
  let config: GraphConfigInterface<N, L>
  $: config = { ...$$restProps }

  // component declaration
  let component: GraphCore<N, L>
  const lifecycle = getContext<Lifecycle>('component')
  // Notifies the container that this component's data or config has changed, so it can re-render
  const dirty = getContext<(() => void) | undefined>('dirty')

  onMount(() => {
    component = new GraphCore<N, L>(config)
    return () => component?.destroy()
  })
  $: if (data !== undefined) { component?.setData(data); dirty?.() }
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = cloneDeep(config)
    // Refresh the container action when configuration changes
    component = component
    dirty?.()
  }

  // component accessor
  export function getComponent (): GraphCore<N, L> { return component }

</script>

<vis-component use:lifecycle={component}></vis-component>

