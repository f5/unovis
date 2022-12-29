<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Graph, GraphConfigInterface, GraphInputNode, GraphInputLink } from '@unovis/ts'
  import { getContext, onDestroy } from 'svelte'

  import type { Lifecycle } from '../../utils/context'
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
  const component = new Graph<N, L>(config)
  const lifecycle = getContext<Lifecycle>('container')

  onDestroy(() => component.destroy())
  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): Graph<N, L> { return component }

</script>

<vis-component use:lifecycle={component}/>

