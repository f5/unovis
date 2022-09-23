<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Graph, GraphConfigInterface, GraphInputNode, GraphInputLink } from '@unovis/ts'
  import { getContext, onMount } from 'svelte'
  import { getActions } from '../../utils/actions'

  // type defs
  type N = $$Generic<GraphInputNode>
  type L = $$Generic<GraphInputLink>

  let config: GraphConfigInterface<N, L>
  $: config = { ...$$restProps }

  // component declaration
  const component = new Graph<N, L>(config)
  const { setComponent, removeComponent } = getContext('container')
  const { setConfig, setData } = getActions.apply(component)
  // data and required props
  export let data: { nodes: N[]; links?: L[] }
  onMount(() => {
    setComponent(component)
    return () => removeComponent(component) as void
  })

  // component accessor
  export function getComponent (): Graph<N, L> { return component }

</script>

<vis-component use:setData={data} use:setConfig={config} />

