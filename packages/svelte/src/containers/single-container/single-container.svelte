<script lang="ts">
  import { ComponentCore, SingleContainer, SingleContainerConfigInterface, Tooltip } from '@unovis/ts'
  import { arePropsEqual } from '../../utils/props'
  import { onDestroy, setContext } from 'svelte'

  // Generics
  type Data = $$Generic

  // Internal variables
  let chart: SingleContainer<Data> | undefined
  let ref: HTMLDivElement
  let component: ComponentCore<Data>
  let tooltip: Tooltip

  // Props
  export let data: Data
  let config: SingleContainerConfigInterface<Data>
  $: props = $$restProps as SingleContainerConfigInterface<Data>
  $: config = { component, tooltip, ...props }

  // Helpers
  function initChart () {
    chart = new SingleContainer<Data>(ref, config, data)
  }
  function updateChart (forceUpdate = false) {
    if (forceUpdate) chart?.update(config, null, data)
    else if (shouldUpdate) chart?.updateContainer(config)
    shouldUpdate = false
  }

  // Reactive statements
  $: chart?.setData(data)
  $: shouldUpdate = Object.keys(props).some(k => !arePropsEqual(chart?.config[k], props[k]))
  $: if (shouldUpdate) updateChart()
  $: if (component) chart === undefined ? initChart() : updateChart(true)

  // Lifecycle and contexts
  setContext('tooltip', () => ({
    update: (t: Tooltip) => { tooltip = t },
    destroy: () => { tooltip = undefined },
  }))

  setContext('component', () => ({
    update: (c: ComponentCore<Data>) => { component = c },
    destroy: () => { component = undefined },
  }))

  onDestroy(() => chart?.destroy())
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
