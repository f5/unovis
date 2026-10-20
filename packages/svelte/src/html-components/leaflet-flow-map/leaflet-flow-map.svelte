<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { LeafletFlowMap as LeafletFlowMapCore } from '@unovis/ts/components/leaflet-flow-map'
  import type { LeafletFlowMapConfigInterface } from '@unovis/ts/components/leaflet-flow-map/config'
  import type { GenericDataRecord } from '@unovis/ts/types/data'
  import type { MapLibreStyleSpecs } from '@unovis/ts/components/leaflet-map/renderer/map-style'
  import { cloneDeep } from '@unovis/ts/utils/data'
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
  let component: LeafletFlowMapCore<PointDatum, FlowDatum>
  let ref: HTMLDivElement

  onMount(() => {
    component = new LeafletFlowMapCore<PointDatum, FlowDatum>(ref, config, data)
    return () => component?.destroy()
  })
  $: if (data !== undefined) component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = cloneDeep(config)
  }

  // component accessor
  export function getComponent (): LeafletFlowMapCore<PointDatum, FlowDatum> { return component }

</script>

<vis-leaflet-flow-map bind:this={ref}></vis-leaflet-flow-map>

<style>
  vis-leaflet-flow-map {
    display:block;
    position:relative;
  }
</style>
