<script setup lang="ts">
import { defineAsyncComponent } from "vue"

const imports = [
  defineAsyncComponent(() => import('@unovis/shared/examples/dual-axis-chart/dual-axis-chart.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/step-area-chart/step-area-chart.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/baseline-area-chart/baseline-area-chart.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/non-stacked-area-chart/non-stacked-area-chart.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/stacked-area-chart/stacked-area-chart.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/stacked-area-chart-with-attributes/stacked-area-chart-with-attributes.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/basic-grouped-bar/basic-grouped-bar.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/basic-leaflet-map/basic-leaflet-map.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/leaflet-flow-map/leaflet-flow-map.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/advanced-leaflet-map/advanced-leaflet-map.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/basic-line-chart/basic-line-chart.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/basic-scatter-plot/basic-scatter-plot.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/brush-grouped-bar/brush-grouped-bar.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/free-brush-scatters/free-brush-scatters.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/horizontal-stacked-bar-chart/horizontal-stacked-bar-chart.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/multi-line-chart/multi-line-chart.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/topojson-map/topojson-map.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/basic-timeline/basic-timeline.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/basic-sankey/basic-sankey.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/expandable-sankey/expandable-sankey.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/dagre-graph/dagre-graph.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/force-graph/force-graph.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/parallel-graph/parallel-graph.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/data-gap-line-chart/data-gap-line-chart.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/crosshair-stacked-bar/crosshair-stacked-bar.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/elk-layered-graph/elk-layered-graph.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/hierarchical-chord-diagram/hierarchical-chord-diagram.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/sunburst-nested-donut/sunburst-nested-donut.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/basic-donut-chart/basic-donut-chart.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/shaped-scatter-plot/shaped-scatter-plot.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/basic-annotations/basic-annotations.vue')),
  defineAsyncComponent(() => import('@unovis/shared/examples/basic-plotband/basic-plotband.vue')),
]
</script>

<template>
  <div class='container'>
    <component v-for="example in imports" :is="example"></component>
  </div>
</template>

<style>
.container {
  margin-top: 25px;
  position: relative;
}


*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  font-weight: normal;
}

body {
  padding: 2rem;
  transition: color 0.5s, background-color 0.5s;
  line-height: 1.6;
  font-family: BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
    Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  font-size: 15px;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
