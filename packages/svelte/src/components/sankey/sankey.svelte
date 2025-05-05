<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Sankey, SankeyConfigInterface, SankeyInputNode, SankeyInputLink } from '@unovis/ts'
  import { onMount, getContext } from 'svelte'

  import type { Lifecycle } from '../../types/context'
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
  const lifecycle = getContext<Lifecycle>('component')

  onMount(() => {
    component = new Sankey<N, L>(config)
    return () => component?.destroy()
  })
  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): Sankey<N, L> { return component }

</script>

<vis-component use:lifecycle={component}/>

