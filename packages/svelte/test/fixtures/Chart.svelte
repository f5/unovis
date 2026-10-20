<script lang="ts">
  import VisLine from '../../dist/components/line/line.svelte'
  import VisAxis from '../../dist/components/axis/axis.svelte'
  import VisDonut from '../../dist/components/donut/donut.svelte'
  import VisXYContainer from '../../dist/containers/xy-container/xy-container.svelte'
  import VisSingleContainer from '../../dist/containers/single-container/single-container.svelte'
  import VisBulletLegend from '../../dist/html-components/bullet-legend/bullet-legend.svelte'
  import type { createState, Datum } from './state'

  export let state: ReturnType<typeof createState>
  let child: VisLine<Datum>
  let owned: VisLine<Datum>
  let donut: VisDonut<Datum>
  let axis: VisAxis<unknown>
  let legend: VisBulletLegend
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

{#if state.showCharts}
  <div id="child">
    <VisXYContainer height={state.height} yDomain={[0, 10]} duration={0}>
      {#if state.showLine}
        <VisLine bind:this={child} data={state.childData} {x} {y} color={state.color} lineWidth={state.lineWidth} duration={0}/>
      {/if}
      {#if state.showAxis}
        <VisAxis bind:this={axis} type={state.axisType} duration={0}/>
      {/if}
    </VisXYContainer>
  </div>
  <div id="owned">
    <VisXYContainer data={state.containerData} height={state.height} yDomain={[0, 10]} duration={0}>
      <VisLine bind:this={owned} {x} {y} duration={0}/>
    </VisXYContainer>
  </div>
  <div id="single">
    <VisSingleContainer data={state.singleData} height={state.height} duration={0}>
      {#if state.showDonut}
        <VisDonut bind:this={donut} value={y} duration={0}/>
      {/if}
    </VisSingleContainer>
  </div>
  <VisBulletLegend bind:this={legend} items={state.legendItems}/>
{/if}
