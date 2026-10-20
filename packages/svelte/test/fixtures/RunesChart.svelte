<script lang="ts">
  import VisLine from '../../dist/components/line/line.svelte'
  import VisAxis from '../../dist/components/axis/axis.svelte'
  import VisDonut from '../../dist/components/donut/donut.svelte'
  import VisXYContainer from '../../dist/containers/xy-container/xy-container.svelte'
  import VisSingleContainer from '../../dist/containers/single-container/single-container.svelte'
  import VisBulletLegend from '../../dist/html-components/bullet-legend/bullet-legend.svelte'
  import type { createState, Datum } from './state'

  // eslint-disable-next-line prefer-const
  let { state: model }: { state: ReturnType<typeof createState> } = $props()
  let child = $state<VisLine<Datum>>()
  let owned = $state<VisLine<Datum>>()
  let donut = $state<VisDonut<Datum>>()
  let axis = $state<VisAxis<unknown>>()
  let legend = $state<VisBulletLegend>()
  const x = (d: Datum): number => d.x
  const y = (d: Datum): number => d.y

  export function components (): Record<string, unknown> {
    return {
      child: child?.getComponent(),
      owned: owned?.getComponent(),
      donut: donut?.getComponent(),
      axis: axis?.getComponent(),
      legend: legend?.getComponent(),
    }
  }
</script>

{#if model.showCharts}
  <div id="child">
    <VisXYContainer height={model.height} yDomain={[0, 10]} duration={0}>
      {#if model.showLine}
        <VisLine bind:this={child} data={model.childData} {x} {y} color={model.color} lineWidth={model.lineWidth} duration={0}/>
      {/if}
      {#if model.showAxis}
        <VisAxis bind:this={axis} type={model.axisType} duration={0}/>
      {/if}
    </VisXYContainer>
  </div>
  <div id="owned">
    <VisXYContainer data={model.containerData} height={model.height} yDomain={[0, 10]} duration={0}>
      <VisLine bind:this={owned} {x} {y} duration={0}/>
    </VisXYContainer>
  </div>
  <div id="single">
    <VisSingleContainer data={model.singleData} height={model.height} duration={0}>
      {#if model.showDonut}
        <VisDonut bind:this={donut} value={y} duration={0}/>
      {/if}
    </VisSingleContainer>
  </div>
  <VisBulletLegend bind:this={legend} items={model.legendItems}/>
{/if}
