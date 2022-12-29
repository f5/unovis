<script lang="ts">
  import { ComponentCore, SingleContainer, SingleContainerConfigInterface, Tooltip } from '@unovis/ts'
  import { onMount, setContext } from 'svelte'
  import { getConfigKey, Lifecycle } from '../../utils/context'

  type Data = $$Generic

  export let data: Data

  let chart: SingleContainer<Data>
  const config: SingleContainerConfigInterface<Data> = {
    component: undefined,
    tooltip: undefined,
  }
  let ref: HTMLDivElement

  $: chart?.setData(data, true)
  $: chart?.updateContainer({ ...config, ...($$restProps as SingleContainerConfigInterface<Data>) })

  onMount(() => {
    chart = new SingleContainer<Data>(ref, config, data)
    return () => chart.destroy()
  })

  setContext<Lifecycle>('container', (_, c: ComponentCore<Data> | Tooltip) => {
    const key = getConfigKey(c)
    if (key && key in config) {
      config[key] = c
      return {
        destroy: () => {
          config[key] = undefined
        },
      }
    }
  })
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
