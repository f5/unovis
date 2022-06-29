<script lang="ts">
  import { XYComponentCore, XYContainerConfigInterface, XYContainer, Tooltip, Axis, AxisType, Crosshair } from '@volterra/vis'
  import { onMount, onDestroy, setContext } from 'svelte'

  type Datum = $$Generic
  let components: XYComponentCore<Datum>[] = []

  export let data: Datum[]

  let chart: XYContainer<Datum>
  let config: XYContainerConfigInterface<Datum> = {}
  let ref: HTMLDivElement

  $: chart?.setData(data, true)
  $: chart?.updateContainer({ ...config, ...($$restProps as XYContainerConfigInterface<Datum>) })

  onMount(() => {
    chart = new XYContainer<Datum>(ref)
  })

  onDestroy(() => {
    chart.destroy()
  })

  const updateConfig = (c: XYContainerConfigInterface<Datum>) => {
    config = { components, ...config, ...c }
  }

  setContext('container', {
    setCrosshair: (c: Crosshair<Datum>) => updateConfig({ crosshair: c }),
    setTooltip: (t: Tooltip) => updateConfig({ tooltip: t }),
    setAxis: (axis: Axis<Datum>) => updateConfig({
      [axis.config.type === AxisType.Y ? 'yAxis' : 'xAxis']: axis
    }),
    setComponent: (c: XYComponentCore<Datum>) => {
      components = [c, ...components]
      updateConfig({ components })
    },
    removeComponent: (c: XYComponentCore<Datum>) => {
      components = components.filter(comp => c !== comp)
      updateConfig({ components })
    }
  })
</script>

<vis-xy-container class='unovis-xy-container' bind:this={ref}>
  {#if chart}
    <slot />
  {/if}
</vis-xy-container>


<style>
  .unovis-xy-container {
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
  }
</style>
