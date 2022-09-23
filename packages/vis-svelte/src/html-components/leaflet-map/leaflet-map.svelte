<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { LeafletMap, LeafletMapConfigInterface, MapLibreStyleSpecs } from '@unovis/ts'
  import { onMount } from 'svelte'
  import { getActions } from '../../utils/actions'

  // type defs
  type Datum = $$Generic

  let config: LeafletMapConfigInterface<Datum>
  $: config = { style, ...$$restProps }

  // component declaration
  let component: LeafletMap<Datum>
  let ref: HTMLDivElement
  const { setConfig, setData } = getActions.apply({
    setConfig: (c: LeafletMapConfigInterface<Datum>) => component?.setConfig(c),
    setData: (d: Datum[]) => component?.setData(d),
    render: () => component?.render()
  })
  // data and required props
  export let data: Datum[]
  export let style: MapLibreStyleSpecs | string
  onMount(() => {
    component = new LeafletMap<Datum>(ref, config, data)
    return () => component.destroy()
  })

  // component accessor
  export function getComponent (): LeafletMap<Datum> { return component }

</script>

<vis-leaflet-map bind:this={ref} use:setData={data} use:setConfig={config} />

<style>
  vis-leaflet-map {
    display:block;
    position:relative;
  }
</style>
