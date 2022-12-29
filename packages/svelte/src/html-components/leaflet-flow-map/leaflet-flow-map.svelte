<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { LeafletFlowMap, LeafletFlowMapConfigInterface, GenericDataRecord, MapLibreStyleSpecs } from '@unovis/ts'
  import { onMount } from 'svelte'

  import { arePropsEqual } from '../../utils/props'
  // type defs
  type PointDatum = $$Generic<GenericDataRecord>
  type FlowDatum = $$Generic<GenericDataRecord>

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: { points: PointDatum[]; flows?: FlowDatum[] } = undefined
  export let style: MapLibreStyleSpecs | string | undefined

  // config
  let prevConfig: LeafletFlowMapConfigInterface<PointDatum, FlowDatum>
  let config: LeafletFlowMapConfigInterface<PointDatum, FlowDatum>
  $: config = { style, ...$$restProps }

  // component declaration
  let component: LeafletFlowMap<PointDatum, FlowDatum>
  let ref: HTMLDivElement

  onMount(() => {
    component = new LeafletFlowMap<PointDatum, FlowDatum>(ref, config, data)
    return () => component.destroy()
  })
  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): LeafletFlowMap<PointDatum, FlowDatum> { return component }

</script>

<vis-leaflet-flow-map bind:this={ref}/>

<style>
  vis-leaflet-flow-map {
    display:block;
    position:relative;
  }
</style>
