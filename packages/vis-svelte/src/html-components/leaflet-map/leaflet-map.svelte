<script lang="ts">
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

  // public methods
  export function zoomIn (increment = 1): void { component.zoomIn(increment) }
  export function zoomOut (increment = 1): void { component.zoomOut(increment) }
  export function setZoom (zoomLevel: number) { component.setZoom(zoomLevel) }
  export function fitView (): void { component.fitView() }
  export function getComponent (): LeafletMap<Datum> { return component }

  onMount(() => {
    component = new LeafletMap<Datum>(ref, config, data)
    return () => component.destroy()
  })

</script>

<vis-leaflet-map bind:this={ref} class='unovis-leaflet' use:setData={data} use:setConfig={config} />

<style>
  .unovis-leaflet {
    display: block;
    position: relative;
  }
</style>
