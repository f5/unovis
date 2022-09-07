<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Sankey, SankeyConfigInterface, SankeyInputNode, SankeyInputLink } from '@unovis/ts'
  import { getContext, onMount } from 'svelte'
  import { getActions } from '../../utils/actions'

  // type defs
  type N = $$Generic<SankeyInputNode>
  type L = $$Generic<SankeyInputLink>

  let config: SankeyConfigInterface<N, L>
  $: config = { ...$$restProps }

  // component declaration
  const component = new Sankey<N, L>(config)
  const { setComponent, removeComponent } = getContext('container')
  const { setConfig, setData } = getActions.apply(component)
  // data and required props
  export let data: { nodes: N[]; links?: L[] }
  onMount(() => {
    setComponent(component)
    return () => removeComponent(component) as void
  })

</script>

<vis-component use:setData={data} use:setConfig={config} />
