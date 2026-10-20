<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { BulletLegend as BulletLegendCore } from '@unovis/ts/components/bullet-legend'
  import type { BulletLegendConfigInterface } from '@unovis/ts/components/bullet-legend/config'
  import type { BulletLegendItemInterface } from '@unovis/ts/components/bullet-legend/types'
  import { cloneDeep } from '@unovis/ts/utils/data'
  import { onMount } from 'svelte'

  import { arePropsEqual } from '../../utils/props'


  // data and required props
  // eslint-disable-next-line no-undef-init
  export let items: BulletLegendItemInterface[]

  // config
  let prevConfig: BulletLegendConfigInterface
  let config: BulletLegendConfigInterface
  $: config = { items, ...$$restProps }

  // component declaration
  let component: BulletLegendCore
  let ref: HTMLDivElement

  onMount(() => {
    component = new BulletLegendCore(ref, { ...config, renderIntoProvidedDomNode: true })
    return () => component?.destroy()
  })
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = cloneDeep(config)
  }

  // component accessor
  export function getComponent (): BulletLegendCore { return component }

</script>

<vis-bullet-legend bind:this={ref}></vis-bullet-legend>

<style>
  vis-bullet-legend {
    display:block;
  }
</style>
