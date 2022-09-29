<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { LeafletMap, LeafletMapConfigInterface, MapLibreStyleSpecs } from '@unovis/ts'
  import { onMount } from 'svelte'
  import { emptyCallback, getActions } from '../../utils/actions'

  // type defs
  type Datum = $$Generic

  let config: LeafletMapConfigInterface<Datum>
  $: config = { style, ...$$restProps }

  // component declaration
  let component: LeafletMap<Datum>
  let ref: HTMLDivElement

  let setConfig = emptyCallback
  let setData = emptyCallback

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: Datum[] = undefined
  export let style: MapLibreStyleSpecs | string

  onMount(() => {
    component = new LeafletMap<Datum>(ref, config, data)
    const actions = getActions.apply({
      setConfig: (c: LeafletMapConfigInterface<Datum>) => { component?.setConfig(c) },
      setData: (d: Datum[]) => { component?.setData(d) },
      render: () => { component?.render() }
    })
    setConfig = actions.setConfig
    setData = actions.setData


    return () => { component.destroy() }
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
