<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Graph, GraphConfigInterface, GraphInputNode, GraphInputLink } from '@volterra/vis'
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

  // public methods
  export function zoomIn (increment = 1): void { component.zoomIn(increment) }
  export function zoomOut (increment = 1): void { component.zoomOut(increment) }
  export function setZoom (zoomLevel: number) { component.setZoom(zoomLevel) }
  export function fitView (): void { component.fitView() }

  onMount(() => {
    setComponent(component)
    return () => removeComponent(component) as void
  })

</script>

<vis-component use:setData={data} use:setConfig={config} />
