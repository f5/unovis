<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { RollingPinLegend, RollingPinLegendConfigInterface, RollingPinLegendItem } from '@unovis/ts'
  import { onMount } from 'svelte'

  import { arePropsEqual } from '../../utils/props'


  // data and required props
  // eslint-disable-next-line no-undef-init
  export let rects: RollingPinLegendItem[]

  // config
  let prevConfig: RollingPinLegendConfigInterface
  let config: RollingPinLegendConfigInterface
  $: config = { rects, ...$$restProps }

  // component declaration
  let component: RollingPinLegend
  let ref: HTMLDivElement

  onMount(() => {
    component = new RollingPinLegend(ref, config)
    return () => component?.destroy()
  })
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): RollingPinLegend { return component }

</script>

<vis-rolling-pin-legend bind:this={ref}/>

<style>
  vis-rolling-pin-legend {
    display:block;
  }
</style>
