<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Sankey, SankeyConfigInterface, SankeyInputNode, SankeyInputLink } from '@unovis/ts'
  import { getContext, onMount } from 'svelte'
  import { emptyCallback, getActions } from '../../utils/actions'

  // type defs
  type N = $$Generic<SankeyInputNode>
  type L = $$Generic<SankeyInputLink>

  let config: SankeyConfigInterface<N, L>
  $: config = { ...$$restProps }

  // component declaration
  let component: Sankey<N, L>
  const { setComponent, removeComponent } = getContext('container')

  let setConfig = emptyCallback
  let setData = emptyCallback

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: { nodes: N[]; links?: L[] } = undefined

  onMount(() => {
    component = new Sankey<N, L>(config)
    const actions = getActions.apply(component)
    setConfig = actions.setConfig
    setData = actions.setData
    setComponent(component)

    return () => { removeComponent(component) as void }
  })

  // component accessor
  export function getComponent (): Sankey<N, L> { return component }

</script>

<vis-component use:setData={data} use:setConfig={config} />

