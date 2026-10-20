<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Sankey as SankeyCore } from '@unovis/ts/components/sankey'
  import type { SankeyConfigInterface } from '@unovis/ts/components/sankey/config'
  import type { SankeyInputNode, SankeyInputLink } from '@unovis/ts/components/sankey/types'
  import { cloneDeep } from '@unovis/ts/utils/data'
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
  let component: SankeyCore<N, L>
  const lifecycle = getContext<Lifecycle>('component')
  // Notifies the container that this component's data or config has changed, so it can re-render
  const dirty = getContext<(() => void) | undefined>('dirty')

  onMount(() => {
    component = new SankeyCore<N, L>(config)
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
  export function getComponent (): SankeyCore<N, L> { return component }

</script>

<vis-component use:lifecycle={component}></vis-component>

