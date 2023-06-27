<script lang="ts">
  import { ComponentCore, SingleContainer, SingleContainerConfigInterface, Tooltip } from '@unovis/ts'
  import { onMount, setContext } from 'svelte'

  type Data = $$Generic

  export let data: Data

  let chart: SingleContainer<Data> | undefined
  const config: SingleContainerConfigInterface<Data> = {
    component: undefined,
    tooltip: undefined,
  }
  let ref: HTMLDivElement

  const initChart = () => {
    if (data && config.component && ref) {
      chart = new SingleContainer<Data>(ref, config, data)
    }
  }
  $: chart ? chart.setData(data, true) : initChart()
  $: chart ? chart.updateContainer({ ...config, ...($$restProps as SingleContainerConfigInterface<Data>) }) : initChart()

  onMount(() => {
    initChart()
    return () => chart?.destroy()
  })

  setContext('tooltip', () => ({
    update: (t: Tooltip) => { config.tooltip = t },
    destroy: () => { config.tooltip = undefined },
  }))

  setContext('component', () => ({
    update: (c: ComponentCore<Data>) => { config.component = c },
    destroy: () => { config.component = undefined },
  }))
</script>

<vis-single-container bind:this={ref} class='unovis-single-container'>
  <slot/>
</vis-single-container>

<style>
  .unovis-single-container {
    display: block;
    position: relative;
    width: 100%;
  }
</style>
