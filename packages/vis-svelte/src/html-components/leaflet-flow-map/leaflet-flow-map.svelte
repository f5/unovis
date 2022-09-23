<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { LeafletFlowMap, LeafletFlowMapConfigInterface, MapLibreStyleSpecs } from '@unovis/ts'
  import { onMount } from 'svelte'
  import { getActions } from '../../utils/actions'

  // type defs
  type PointDatum = $$Generic
  type FlowDatum = $$Generic

  let config: LeafletFlowMapConfigInterface<PointDatum, FlowDatum>
  $: config = { style, ...$$restProps }

  // component declaration
  let component: LeafletFlowMap<PointDatum, FlowDatum>
  let ref: HTMLDivElement
  const { setConfig, setData } = getActions.apply({
    setConfig: (c: LeafletFlowMapConfigInterface<PointDatum, FlowDatum>) => component?.setConfig(c),
    setData: (d: { points: PointDatum[]; flows?: FlowDatum[] }) => component?.setData(d),
    render: () => component?.render()
  })
  // data and required props
  export let data: { points: PointDatum[]; flows?: FlowDatum[] }
  export let style: MapLibreStyleSpecs | string
  onMount(() => {
    component = new LeafletFlowMap<PointDatum, FlowDatum>(ref, config, data)
    return () => component.destroy()
  })

  // component accessor
  export function getComponent (): LeafletFlowMap<PointDatum, FlowDatum> { return component }

</script>

<vis-leaflet-flow-map bind:this={ref} use:setData={data} use:setConfig={config} />

<style>
  vis-leaflet-flow-map {
    display:block;
    position:relative;
  }
</style>
