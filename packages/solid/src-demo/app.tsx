import { For, lazy } from 'solid-js'

const examples = [
  // Composite Charts
  lazy(() => import('@unovis/shared/examples/dual-axis-chart/dual-axis-chart-solid')),
  lazy(() => import('@unovis/shared/examples/range-plot/range-plot-solid')),
  // Line Charts
  lazy(() => import('@unovis/shared/examples/basic-line-chart/basic-line-chart-solid')),
  lazy(() => import('@unovis/shared/examples/multi-line-chart/multi-line-chart-solid')),
  lazy(() => import('@unovis/shared/examples/data-gap-line-chart/data-gap-line-chart-solid')),
  lazy(() => import('@unovis/shared/examples/patchy-line-chart/patchy-line-chart-solid')),
  lazy(() => import('@unovis/shared/examples/basic-timeline/basic-timeline-solid')),
  // Area Charts
  lazy(() => import('@unovis/shared/examples/non-stacked-area-chart/non-stacked-area-chart-solid')),
  lazy(() => import('@unovis/shared/examples/stacked-area-chart/stacked-area-chart-solid')),
  lazy(() => import('@unovis/shared/examples/stacked-area-chart-with-attributes/stacked-area-chart-with-attributes-solid')),
  lazy(() => import('@unovis/shared/examples/baseline-area-chart/baseline-area-chart-solid')),
  lazy(() => import('@unovis/shared/examples/step-area-chart/step-area-chart-solid')),
  // Bar Charts
  lazy(() => import('@unovis/shared/examples/basic-grouped-bar/basic-grouped-bar-solid')),
  lazy(() => import('@unovis/shared/examples/horizontal-stacked-bar-chart/horizontal-stacked-bar-chart-solid')),
  // Scatter Plots
  lazy(() => import('@unovis/shared/examples/basic-scatter-plot/basic-scatter-plot-solid')),
  lazy(() => import('@unovis/shared/examples/sized-scatter-plot/sized-scatter-plot-solid')),
  lazy(() => import('@unovis/shared/examples/shaped-scatter-plot/shaped-scatter-plot-solid')),
  // Maps
  lazy(() => import('@unovis/shared/examples/basic-leaflet-map/basic-leaflet-map-solid')),
  lazy(() => import('@unovis/shared/examples/leaflet-flow-map/leaflet-flow-map-solid')),
  lazy(() => import('@unovis/shared/examples/advanced-leaflet-map/advanced-leaflet-map-solid')),
  lazy(() => import('@unovis/shared/examples/topojson-map/topojson-map-solid')), // Slider not updating map color
  // Networks and Flows
  lazy(() => import('@unovis/shared/examples/basic-sankey/basic-sankey-solid')),
  lazy(() => import('@unovis/shared/examples/expandable-sankey/expandable-sankey-solid')),
  lazy(() => import('@unovis/shared/examples/dagre-graph/dagre-graph-solid')),
  lazy(() => import('@unovis/shared/examples/force-graph/force-graph-solid')),
  lazy(() => import('@unovis/shared/examples/parallel-graph/parallel-graph-solid')),
  lazy(() => import('@unovis/shared/examples/elk-layered-graph/elk-layered-graph-solid')),
  // Circular Charts
  lazy(() => import('@unovis/shared/examples/basic-donut-chart/basic-donut-chart-solid')),
  lazy(() => import('@unovis/shared/examples/hierarchical-chord-diagram/hierarchical-chord-diagram-solid')),
  lazy(() => import('@unovis/shared/examples/sunburst-nested-donut/sunburst-nested-donut-solid')),
  // Auxiliary Components
  lazy(() => import('@unovis/shared/examples/basic-annotations/basic-annotations-solid')),
  lazy(() => import('@unovis/shared/examples/crosshair-stacked-bar/crosshair-stacked-bar-solid')),
  lazy(() => import('@unovis/shared/examples/brush-grouped-bar/brush-grouped-bar-solid')),
  lazy(() => import('@unovis/shared/examples/free-brush-scatters/free-brush-scatters-solid')),
  lazy(() => import('@unovis/shared/examples/plotband-plotline/plotband-plotline-solid')),
]

const App = () => {
  return (
    <div class='container'>
      <For each={examples}>{(example) => <>{example}</>}</For>
    </div>
  )
}

export default App
