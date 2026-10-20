<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { LeafletMap as LeafletMapCore } from '@unovis/ts/components/leaflet-map'
  import type { LeafletMapConfigInterface } from '@unovis/ts/components/leaflet-map/config'
  import type { GenericDataRecord } from '@unovis/ts/types/data'
  import type { MapLibreStyleSpecs } from '@unovis/ts/components/leaflet-map/renderer/map-style'
  import { cloneDeep } from '@unovis/ts/utils/data'
  import { onMount } from 'svelte'

  import { arePropsEqual } from '../../utils/props'
  // type defs
  type Datum = $$Generic<GenericDataRecord>

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: Datum[] = undefined
  export let style: MapLibreStyleSpecs | string | undefined

  // config
  let prevConfig: LeafletMapConfigInterface<Datum>
  let config: LeafletMapConfigInterface<Datum>
  $: config = { style, ...$$restProps }

  // component declaration
  let component: LeafletMapCore<Datum>
  let ref: HTMLDivElement

  onMount(() => {
    component = new LeafletMapCore<Datum>(ref, config, data)
    return () => component?.destroy()
  })
  $: if (data !== undefined) component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = cloneDeep(config)
  }

  // component accessor
  export function getComponent (): LeafletMapCore<Datum> { return component }

</script>

<vis-leaflet-map bind:this={ref}></vis-leaflet-map>

<style>
  vis-leaflet-map {
    display:block;
    position:relative;
  }
</style>
