<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { FlowLegend, FlowLegendConfigInterface } from '@unovis/ts'
  import { onMount } from 'svelte'

  import { arePropsEqual } from '../../utils/props'


  // config
  let prevConfig: FlowLegendConfigInterface
  let config: FlowLegendConfigInterface
  $: config = { ...$$restProps }

  // component declaration
  let component: FlowLegend
  let ref: HTMLDivElement

  onMount(() => {
    component = new FlowLegend(ref, { ...config, renderIntoProvidedDomNode: true })
    return () => component?.destroy()
  })
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): FlowLegend { return component }

</script>

<vis-flow-legend bind:this={ref}/>

<style>
  vis-flow-legend {
    display:block;
  }
</style>
