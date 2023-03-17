<script>
  const imports = [
    () => import('./examples/step-area-chart/step-area-chart.svelte'),
    () => import('./examples/baseline-area-chart/baseline-area-chart.svelte'),
    () => import('./examples/non-stacked-area-chart/non-stacked-area-chart.svelte'),
    () => import('./examples/stacked-area-chart/stacked-area-chart.svelte'),
    () => import('./examples/basic-grouped-bar/basic-grouped-bar.svelte'),
    () => import('./examples/basic-leaflet-map/basic-leaflet-map.svelte'),
    () => import('./examples/leaflet-flow-map/leaflet-flow-map.svelte'),
    () => import('./examples/advanced-leaflet-map/advanced-leaflet-map.svelte'),
    () => import('./examples/basic-line-chart/basic-line-chart.svelte'),
    () => import('./examples/basic-scatter-chart/basic-scatter-chart.svelte'),
    () => import('./examples/brush-grouped-bar/brush-grouped-bar.svelte'),
    () => import('./examples/free-brush-scatters/free-brush-scatters.svelte'),
    () => import('./examples/horizontal-stacked-bar-chart/horizontal-stacked-bar-chart.svelte'),
    () => import('./examples/multi-line-chart/multi-line-chart.svelte'),
    () => import('./examples/topojson-map/topojson-map.svelte'),
    () => import('./examples/basic-timeline/basic-timeline.svelte'),
    () => import('./examples/basic-sankey/basic-sankey.svelte'),
    () => import('./examples/expandable-sankey/expandable-sankey.svelte'),
    () => import('./examples/dagre-graph/dagre-graph.svelte'),
    () => import('./examples/force-graph/force-graph.svelte'),
    () => import('./examples/parallel-graph/parallel-graph.svelte'),
    () => import('./examples/data-gap-line-chart/data-gap-line-chart.svelte'),
    () => import('./examples/crosshair-stacked-bar/crosshair-stacked-bar.svelte'),
    () => import('./examples/elk-layered-graph/elk-layered-graph.svelte'),
    () => import('./examples/hierarchical-chord-diagram/hierarchical-chord-diagram.svelte'),
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

