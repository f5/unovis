<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Sankey, SankeyConfigInterface, SankeyInputNode, SankeyInputLink } from '@unovis/ts'
  import { getContext, onMount } from 'svelte'
  import { arePropsEqual } from '../../utils/props'

  // type defs
  type N = $$Generic<SankeyInputNode>
  type L = $$Generic<SankeyInputLink>

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: { nodes: N[]; links?: L[] } = undefined

  // config
  let prevConfig: SankeyConfigInterface<N, L>
  let config: SankeyConfigInterface<N, L>
  $: config = { ...$$restProps }

  // component declaration
  let component: Sankey<N, L>
  const { setComponent, removeComponent } = getContext('container')

  onMount(() => {
    component = new Sankey<N, L>(config)
    setComponent(component)
    return () => { removeComponent(component) as void }
  })

  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): Sankey<N, L> { return component }

</script>

<vis-component/>

