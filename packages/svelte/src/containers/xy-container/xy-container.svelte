<script lang="ts">
  import { XYContainer, XYComponentCore, XYContainerConfigInterface, Tooltip } from '@unovis/ts'
  import { onMount, setContext } from 'svelte'
  import { Lifecycle, getConfigKey } from '../../utils/context'

  type Datum = $$Generic

  export let data: Datum[]

  let chart: XYContainer<Datum>
  const config: XYContainerConfigInterface<Datum> = {
    components: [],
    crosshair: undefined,
    tooltip: undefined,
    xAxis: undefined,
    yAxis: undefined,
  }
  let ref: HTMLDivElement

  $: chart?.setData(data, true)
  $: chart?.updateContainer({ ...config, ...($$restProps as XYContainerConfigInterface<Datum>) })

  onMount(() => {
    chart = new XYContainer(ref, config, data)
    return () => chart.destroy()
  })

  setContext<Lifecycle>('container', (_, c: XYComponentCore<Datum> | Tooltip) => {
    const key = getConfigKey(c)
    if (key && key in config) {
      const coreComponent = key === 'components'
      config[key] = coreComponent ? [...config.components, c] : c
      return {
        destroy: () => {
          config[key] = coreComponent ? config.components.filter(comp => comp !== c) : undefined
        },
      }
    }
  })
</script>

<vis-xy-container bind:this={ref} class='unovis-xy-container'>
  <slot />
</vis-xy-container>


<style>
  .unovis-xy-container {
    display: block;
    position: relative;
    width: 100%;
  }
</style>
