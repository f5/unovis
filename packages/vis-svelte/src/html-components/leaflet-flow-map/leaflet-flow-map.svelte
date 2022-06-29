<script lang="ts">
  import { LeafletFlowMap, LeafletFlowMapConfigInterface, MapLibreStyleSpecs } from '@volterra/vis'
  import { onMount } from 'svelte'
  import { getActions } from '../../utils/actions'

  type PointDatum = $$Generic
  type FlowDatum = $$Generic

  let config: LeafletFlowMapConfigInterface<PointDatum, FlowDatum>
  $: config = { style, ...$$restProps }

  // component declaration
  let ref: HTMLDivElement
  let component: LeafletFlowMap<PointDatum, FlowDatum>
  const { setConfig, setData } = getActions.apply({
    setConfig: (c: LeafletFlowMapConfigInterface<PointDatum, FlowDatum>) => component?.setConfig(c),
    setData: (d: { points: PointDatum[]; flows?: FlowDatum[] }) => component?.setData(d),
    render: () => component?.render()
  })

  // data and required props
  export let data: { points: PointDatum[]; flows?: FlowDatum[] }
  export let style: MapLibreStyleSpecs | string

  // public methods
  export function zoomIn (increment = 1): void { component.zoomIn(increment) }
  export function zoomOut (increment = 1): void { component.zoomOut(increment) }
  export function setZoom (zoomLevel: number) { component.setZoom(zoomLevel) }
  export function fitView (): void { component.fitView() }

  onMount(() => {
    component = new LeafletFlowMap<PointDatum, FlowDatum>(ref, config, data)
    return () => component.destroy()
  })

</script>

<vis-leaflet-flow-map bind:this={ref} class='unovis-leaflet' use:setData={data} use:setConfig={config} />

<style>
  .unovis-leaflet {
    display: block;
    position: relative;
  }
</style>
