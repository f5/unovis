<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Graph, GraphConfigInterface, GraphInputNode, GraphInputLink } from '@volterra/vis'
  import { getContext, onMount } from 'svelte'
  import { getActions } from '../../utils/actions'

  type N = $$Generic<GraphInputNode>
  type L = $$Generic<GraphInputLink>

  // data and required props
  export let data: any


  let config: GraphConfigInterface<N, L>
  $: config = { ...$$restProps }

  const component = new Graph<N, L>()

  const { setComponent, removeComponent } = getContext('container')
  const { setConfig, setData } = getActions.apply(component)

  onMount(() => {
    setComponent(component)

    return () => removeComponent(component) as void
  })
</script>

<vis-component use:setData={data} use:setConfig={config} />
