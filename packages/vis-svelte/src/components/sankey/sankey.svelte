<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Sankey, SankeyConfigInterface, SankeyInputNode, SankeyInputLink } from '@volterra/vis'
  import { getContext, onMount } from 'svelte'
  import { getActions } from '../../utils/actions'

  type N = $$Generic<SankeyInputNode>
  type L = $$Generic<SankeyInputLink>

  // data and required props
  export let data: any


  let config: SankeyConfigInterface<N, L>
  $: config = { ...$$restProps }

  const component = new Sankey<N, L>()

  const { setComponent, removeComponent } = getContext('container')
  const { setConfig, setData } = getActions.apply(component)

  onMount(() => {
    setComponent(component)

    return () => removeComponent(component) as void
  })
</script>

<vis-component use:setData={data} use:setConfig={config} />
