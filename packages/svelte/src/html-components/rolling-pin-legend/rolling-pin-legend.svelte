<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { RollingPinLegend as RollingPinLegendCore } from '@unovis/ts/components/rolling-pin-legend'
  import type { RollingPinLegendConfigInterface } from '@unovis/ts/components/rolling-pin-legend/config'
  import type { RollingPinLegendItem } from '@unovis/ts/components/rolling-pin-legend/types'
  import { cloneDeep } from '@unovis/ts/utils/data'
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
  let component: RollingPinLegendCore
  let ref: HTMLDivElement

  onMount(() => {
    component = new RollingPinLegendCore(ref, config)
    return () => component?.destroy()
  })
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = cloneDeep(config)
  }

  // component accessor
  export function getComponent (): RollingPinLegendCore { return component }

</script>

<vis-rolling-pin-legend bind:this={ref}></vis-rolling-pin-legend>

<style>
  vis-rolling-pin-legend {
    display:block;
  }
</style>
