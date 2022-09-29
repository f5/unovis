<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { BulletLegend, BulletLegendConfigInterface, BulletLegendItemInterface } from '@unovis/ts'
  import { onMount } from 'svelte'
  import { emptyCallback, getActions } from '../../utils/actions'


  let config: BulletLegendConfigInterface
  $: config = { items, ...$$restProps }

  // component declaration
  let component: BulletLegend
  let ref: HTMLDivElement

  let setConfig = emptyCallback


  // data and required props
  // eslint-disable-next-line no-undef-init
  export let items: BulletLegendItemInterface[]

  onMount(() => {
    component = new BulletLegend(ref, config)
    const actions = getActions.apply({
      setConfig: (c: BulletLegendConfigInterface) => { component?.update(c) },
      render: () => { component?.render() }
    })
    setConfig = actions.setConfig


    return () => { component.destroy() }
  })

  // component accessor
  export function getComponent (): BulletLegend { return component }

</script>

<vis-bullet-legend bind:this={ref} use:setConfig={config} />

<style>
  vis-bullet-legend {
    display:block;
  }
</style>
