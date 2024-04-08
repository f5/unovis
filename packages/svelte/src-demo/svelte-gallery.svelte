<script>
  const imports = [
    () => import('@unovis/shared/examples/step-area-chart/step-area-chart.svelte'),
    () => import('@unovis/shared/examples/baseline-area-chart/baseline-area-chart.svelte'),
    () => import('@unovis/shared/examples/non-stacked-area-chart/non-stacked-area-chart.svelte'),
    () => import('@unovis/shared/examples/stacked-area-chart/stacked-area-chart.svelte'),
    () => import('@unovis/shared/examples/basic-grouped-bar/basic-grouped-bar.svelte'),
    () => import('@unovis/shared/examples/basic-leaflet-map/basic-leaflet-map.svelte'),
    () => import('@unovis/shared/examples/leaflet-flow-map/leaflet-flow-map.svelte'),
    () => import('@unovis/shared/examples/advanced-leaflet-map/advanced-leaflet-map.svelte'),
    () => import('@unovis/shared/examples/basic-line-chart/basic-line-chart.svelte'),
    () => import('@unovis/shared/examples/basic-scatter-chart/basic-scatter-chart.svelte'),
    () => import('@unovis/shared/examples/brush-grouped-bar/brush-grouped-bar.svelte'),
    () => import('@unovis/shared/examples/free-brush-scatters/free-brush-scatters.svelte'),
    () => import('@unovis/shared/examples/horizontal-stacked-bar-chart/horizontal-stacked-bar-chart.svelte'),
    () => import('@unovis/shared/examples/multi-line-chart/multi-line-chart.svelte'),
    () => import('@unovis/shared/examples/topojson-map/topojson-map.svelte'),
    () => import('@unovis/shared/examples/basic-timeline/basic-timeline.svelte'),
    () => import('@unovis/shared/examples/basic-sankey/basic-sankey.svelte'),
    () => import('@unovis/shared/examples/expandable-sankey/expandable-sankey.svelte'),
    () => import('@unovis/shared/examples/dagre-graph/dagre-graph.svelte'),
    () => import('@unovis/shared/examples/force-graph/force-graph.svelte'),
    () => import('@unovis/shared/examples/parallel-graph/parallel-graph.svelte'),
    () => import('@unovis/shared/examples/data-gap-line-chart/data-gap-line-chart.svelte'),
    () => import('@unovis/shared/examples/crosshair-stacked-bar/crosshair-stacked-bar.svelte'),
    () => import('@unovis/shared/examples/elk-layered-graph/elk-layered-graph.svelte'),
    () => import('@unovis/shared/examples/hierarchical-chord-diagram/hierarchical-chord-diagram.svelte'),
    () => import('@unovis/shared/examples/sunburst-nested-donut/sunburst-nested-donut.svelte'),
    () => import('@unovis/shared/examples/basic-donut-chart/basic-donut-chart.svelte'),
  ]
</script>

<div class='container'>
  {#each imports as example}
    {#await example() then module}
      <svelte:component this={module.default}/>
    {/await}
  {/each}
</div>

<style>
  .container {
    margin-top: 25px;
    position: relative;
  }
</style>

