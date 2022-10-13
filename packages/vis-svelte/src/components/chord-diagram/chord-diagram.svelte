<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { ChordDiagram, ChordDiagramConfigInterface, ChordInputNode, ChordInputLink } from '@unovis/ts'
  import { getContext, onMount } from 'svelte'
  import { arePropsEqual } from '../../utils/props'

  // type defs
  type N = $$Generic<ChordInputNode>
  type L = $$Generic<ChordInputLink>

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: { nodes: N[]; links?: L[] } = undefined

  // config
  let prevConfig: ChordDiagramConfigInterface<N, L>
  let config: ChordDiagramConfigInterface<N, L>
  $: config = { ...$$restProps }

  // component declaration
  let component: ChordDiagram<N, L>
  const { setComponent, removeComponent } = getContext('container')

  onMount(() => {
    component = new ChordDiagram<N, L>(config)
    setComponent(component)
    return () => { removeComponent(component) as void }
  })

  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): ChordDiagram<N, L> { return component }

</script>

<vis-component/>

