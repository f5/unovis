<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { BulletLegend, BulletLegendConfigInterface, BulletLegendItemInterface } from '@unovis/ts'
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
  let component: BulletLegend
  let ref: HTMLDivElement

  onMount(() => {
    component = new BulletLegend(ref, config)

    return () => { component.destroy() }
  })

  $: if (!arePropsEqual(prevConfig, config)) {
    component?.update(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): BulletLegend { return component }

</script>

<vis-bullet-legend bind:this={ref}/>

<style>
  vis-bullet-legend {
    display:block;
  }
</style>
