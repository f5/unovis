<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { ChordDiagram, ChordDiagramConfigInterface, ChordInputNode, ChordInputLink } from '@volterra/vis'
  import { getContext, onMount } from 'svelte'
  import { getActions } from '../../utils/actions'

  // type defs
  type N = $$Generic<ChordInputNode>
  type L = $$Generic<ChordInputLink>

  let config: ChordDiagramConfigInterface<N, L>
  $: config = { ...$$restProps }

  // component declaration
  const component = new ChordDiagram<N, L>(config)
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
