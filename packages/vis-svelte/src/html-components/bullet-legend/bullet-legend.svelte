<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { BulletLegend, BulletLegendConfigInterface, BulletLegendItemInterface } from '@volterra/vis'
  import { onMount } from 'svelte'
  import { getActions } from '../../utils/actions'


  let config: BulletLegendConfigInterface
  $: config = { items, ...$$restProps }

  // component declaration
  let component: BulletLegend
  let ref: HTMLDivElement
  const { setConfig } = getActions.apply({
    setConfig: (c: BulletLegendConfigInterface) => component?.update(c),
    render: () => component?.render()
  })

  // data and required props
  export let items: BulletLegendItemInterface[]

  onMount(() => {
    component = new BulletLegend(ref, config)
    return () => component.destroy()
  })

</script>

<vis-bullet-legend bind:this={ref} style:display='block' use:setConfig={config} />
