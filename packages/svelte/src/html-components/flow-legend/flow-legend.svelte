<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { FlowLegend as FlowLegendCore } from '@unovis/ts/components/flow-legend'
  import type { FlowLegendConfigInterface } from '@unovis/ts/components/flow-legend/config'
  import { cloneDeep } from '@unovis/ts/utils/data'
  import { onMount } from 'svelte'

  import { arePropsEqual } from '../../utils/props'


  // config
  let prevConfig: FlowLegendConfigInterface
  let config: FlowLegendConfigInterface
  $: config = { ...$$restProps }

  // component declaration
  let component: FlowLegendCore
  let ref: HTMLDivElement

  onMount(() => {
    component = new FlowLegendCore(ref, { ...config, renderIntoProvidedDomNode: true })
    return () => component?.destroy()
  })
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = cloneDeep(config)
  }

  // component accessor
  export function getComponent (): FlowLegendCore { return component }

</script>

<vis-flow-legend bind:this={ref}></vis-flow-legend>

<style>
  vis-flow-legend {
    display:block;
  }
</style>
