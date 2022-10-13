<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { LeafletMap, LeafletMapConfigInterface, MapLibreStyleSpecs } from '@unovis/ts'
  import { onMount } from 'svelte'
  import { arePropsEqual } from '../../utils/props'

  // type defs
  type Datum = $$Generic

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: Datum[] = undefined
  export let style: MapLibreStyleSpecs | string

  // config
  let prevConfig: LeafletMapConfigInterface<Datum>
  let config: LeafletMapConfigInterface<Datum>
  $: config = { style, ...$$restProps }

  // component declaration
  let component: LeafletMap<Datum>
  let ref: HTMLDivElement

  onMount(() => {
    component = new LeafletMap<Datum>(ref, config, data)

    return () => { component.destroy() }
  })

  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): LeafletMap<Datum> { return component }

</script>

<vis-leaflet-map bind:this={ref}/>

<style>
  vis-leaflet-map {
    display:block;
    position:relative;
  }
</style>
