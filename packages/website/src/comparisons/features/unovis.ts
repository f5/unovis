import type { LibrarySupport } from './types'

const gallery = (title: string): string => `/gallery/view?title=${encodeURIComponent(title)}`

export const unovisSupport: LibrarySupport = {
  // Platform
  renderer: { status: 'yes', value: 'SVG', note: 'SVG (CSS-stylable DOM); maps use Leaflet with MapLibre GL' },
  frameworks: { status: 'yes', note: 'Official React, Angular, Vue, Svelte and Solid wrappers generated from one TypeScript core, plus vanilla TS/JS', url: '/docs/quick-start#component-import' },
  typescript: { status: 'yes', note: 'Written in TypeScript; every component config is generic over your datum type', url: '/docs/quick-start' },
  treeShaking: { status: 'yes', note: 'ES modules; import only the components you use', url: '/docs/quick-start#component-import' },
  theming: { status: 'yes', note: 'Every visual property is a CSS variable: theme globally, per chart or per component', url: '/docs/guides/theming#css-variables' },
  darkMode: { status: 'yes', note: 'Automatic: follows a `theme-dark` class or `data-theme="dark"` attribute, no chart code', url: '/docs/guides/theming#dark-theme-usage' },
  responsive: { status: 'yes', note: 'Containers resize with their parent by default', url: '/docs/containers/XY_Container#width-and-height' },
  animation: { status: 'yes', note: 'All components animate data updates with D3 transitions; `duration` controls or disables them', url: '/docs/containers/XY_Container#animation' },
  ssr: { status: 'yes', note: '`@unovis/ssr` renders any chart to standalone SVG or PNG in Node', url: 'https://github.com/f5/unovis/tree/main/packages/ssr' },
  a11y: { status: 'partial', note: '`ariaLabel`, `role="figure"`, pattern fills for color-blind-safe charts; no keyboard navigation', url: '/docs/containers/XY_Container#accessibility' },
  'mcp-server': { status: 'yes', note: '`@unovis/mcp` renders charts locally to SVG, PNG or interactive HTML, and writes the code for React, Angular, Svelte, Vue, Solid or TS', url: '/docs/mcp' },
  'typed-docs': { status: 'yes', note: '99% of config options have JSDoc in the published `.d.ts` files, 96% with their default', url: 'https://unpkg.com/@unovis/ts@1.7.0/components/line/config.d.ts' },
  'llms-txt': { status: 'no', note: 'No llms.txt on unovis.dev' },

  // XY charts
  line: { status: 'yes', note: 'Line component', url: '/docs/components/Line' },
  'area-stacked': { status: 'yes', note: 'Area with an array of `y` accessors stacks automatically', url: '/docs/components/Area#stacked-areas' },
  stream: { status: 'yes', note: 'Area `baseline` accessor (per data point) builds stream graphs', url: gallery('Area with Baseline') },
  'bar-grouped': { status: 'yes', note: 'GroupedBar component', url: '/docs/components/GroupedBar' },
  'bar-stacked': { status: 'yes', note: 'StackedBar component', url: '/docs/components/StackedBar' },
  'bar-horizontal': { status: 'yes', note: '`orientation: horizontal` on StackedBar and GroupedBar', url: gallery('Horizontal Stacked Bar Chart with Tooltip and Legend') },
  scatter: { status: 'yes', note: 'Scatter component', url: '/docs/components/Scatter' },
  bubble: { status: 'yes', note: 'Scatter `size` accessor with automatic `sizeRange` scaling', url: '/docs/components/Scatter#size-and-size-range' },
  timeline: { status: 'yes', note: 'Timeline component with rows, labels and arrows', url: '/docs/components/Timeline#arrows' },
  boxplot: { status: 'yes', note: 'Boxplot component', url: '/docs/components/Boxplot' },
  heatmap: { status: 'yes', note: 'Heatmap component', url: '/docs/components/Heatmap' },
  candlestick: { status: 'no', note: 'No candlestick component' },
  waterfall: { status: 'custom', note: 'StackedBar with a `baseline` that carries the running total you compute', url: '/docs/components/StackedBar#waterfall-charts' },
  histogram: { status: 'custom', note: 'Bin the data (e.g. with d3-array) and render with StackedBar', url: '/docs/components/StackedBar' },

  // Radial and hierarchical
  donut: { status: 'yes', note: 'Donut component (pie when `arcWidth` is 0)', url: '/docs/components/Donut#arc-width' },
  sunburst: { status: 'yes', note: 'NestedDonut component for hierarchical data', url: gallery('Sunburst Nested Donut') },
  'radial-bar': { status: 'yes', note: 'RadialBar component: one ring per record, the value fills the ring', url: '/docs/components/RadialBar' },
  'circular-bar': { status: 'yes', note: 'CircularBar component: petal-shaped bars around a hole, per-bar `maxValue`, icons and a background track', url: '/docs/components/CircularBar' },
  radar: { status: 'no', note: 'No radar component' },
  treemap: { status: 'yes', note: 'Treemap component', url: '/docs/components/Treemap' },
  funnel: { status: 'no', note: 'No funnel component' },
  gauge: { status: 'custom', note: 'Donut with `angleRange` and `showBackground` makes a semicircle gauge; no needle', url: '/docs/components/Donut#half-donut-charts' },

  // Networks and flows
  sankey: { status: 'yes', note: 'Sankey component with sub-labels, label fitting, zoom and pan', url: '/docs/components/Sankey' },
  chord: { status: 'yes', note: 'ChordDiagram component, including hierarchical chords', url: '/docs/components/ChordDiagram#hierarchical-data' },
  network: { status: 'yes', note: 'Graph component with a force layout, icons, side labels, panels and custom node rendering', url: '/docs/components/Graph#force' },
  dag: { status: 'yes', note: 'Graph `dagre` and `elk` layouts (plus parallel, concentric and circular)', url: '/docs/components/Graph#elk' },
  'graph-zoom': { status: 'yes', note: 'Zoom, pan and node dragging on by default; `disableZoom`, `disableDrag`, `zoomScaleExtent`', url: '/docs/components/Graph#pan--zoom--drag' },

  // Maps
  choropleth: { status: 'yes', note: 'TopoJSONMap component with areas, points and links', url: '/docs/components/TopoJSONMap' },
  'tile-map': { status: 'yes', note: 'LeafletMap with MapLibre GL vector tiles and built-in point clustering', url: '/docs/components/LeafletMap#clusters' },
  'flow-map': { status: 'yes', note: 'LeafletFlowMap with animated particle flows', url: '/docs/components/LeafletFlowMap' },
  'map-zoom': { status: 'yes', note: 'TopoJSONMap and LeafletMap zoom and pan by default; `zoomExtent` and `disableZoom` on TopoJSONMap', url: '/docs/components/TopoJSONMap#zoom' },
  'map-projections': { status: 'yes', note: '`MapProjection` has 30 d3 projections, or pass any d3 projection; Kavrayskiy7 by default', url: '/docs/components/TopoJSONMap#projections' },

  // Building blocks
  tooltip: { status: 'yes', note: 'Tooltip component: HTML templates, triggered by any chart element', url: '/docs/components/Tooltip' },
  crosshair: { status: 'yes', note: 'Crosshair snaps to data, highlights every series and feeds the tooltip', url: '/docs/components/Crosshair' },
  legend: { status: 'yes', note: 'Separate BulletLegend, FlowLegend and RollingPinLegend components, placed anywhere', url: '/docs/components/BulletLegend' },
  'legend-toggle': { status: 'custom', note: 'BulletLegend `onLegendItemClick` + `inactive` items; a few lines of state', url: '/docs/components/BulletLegend#interactive-legend' },
  brush: { status: 'yes', note: 'Brush for ranges, FreeBrush for 2D selections', url: '/docs/components/Brush' },
  'zoom-pan': { status: 'custom', note: 'No wheel zoom or pan; a Brush selection sets the container `xDomain` to zoom in', url: gallery('Grouped Bar with Brush and Interactive Legend') },
  'reference-line': { status: 'yes', note: 'Plotline component', url: '/docs/components/Plotline' },
  'reference-band': { status: 'yes', note: 'Plotband component', url: '/docs/components/Plotband' },
  annotations: { status: 'yes', note: 'Annotations component, positioned in data or pixel coordinates', url: '/docs/components/Annotations#positioning' },
  'data-labels': { status: 'yes', note: 'XYLabels component; Scatter, Sankey, Graph and Treemap labels', url: '/docs/components/XYLabels' },
  'label-collision': { status: 'yes', note: 'XYLabels clusters overlapping labels; Scatter and Axis hide overlapping ones', url: '/docs/components/XYLabels#label-clustering' },
  'axis-label-fit': { status: 'yes', note: 'Axis wraps or trims tick labels to the available width by default', url: '/docs/components/Axis#tick-label-fit-mode' },

  // Chart details
  'line-gaps': { status: 'yes', note: 'Undefined values break the line', url: '/docs/components/Line#dealing-with-missing-data' },
  'line-interpolate': { status: 'yes', note: '`interpolateMissingData` bridges gaps with a dashed line; or `fallbackValue`', url: '/docs/components/Line#line-interpolation' },
  'curve-types': { status: 'yes', note: 'All D3 curves via `curveType` (monotone by default)', url: '/docs/components/Line#curve-type' },
  'area-baseline': { status: 'yes', note: '`baseline` accessor, per data point', url: gallery('Area with Baseline') },
  'bar-rounded': { status: 'yes', note: '`roundedCorners`, on by default', url: '/docs/components/StackedBar#rounded-corners' },
  'bar-negative-stack': { status: 'yes', note: 'Negative values stack below the baseline automatically', url: '/docs/components/StackedBar#baseline' },
  'scatter-shapes': { status: 'yes', note: 'circle, cross, diamond, square, star, triangle, wye', url: gallery('Scatter Plot with Varied Shape') },
  'scatter-nearest': { status: 'yes', note: 'Crosshair `snapMode: \'xy\'` snaps to the point nearest the pointer', url: '/docs/components/Crosshair#snap-mode' },
  'donut-central-label': { status: 'yes', note: '`centralLabel` and `centralSubLabel`', url: '/docs/components/Donut#labels' },
  'donut-pad-angle': { status: 'yes', note: '`padAngle`', url: '/docs/components/Donut#pad-angle' },
  'donut-corner-radius': { status: 'yes', note: '`cornerRadius`', url: '/docs/components/Donut#corner-radius' },
  'arc-labels': { status: 'partial', note: 'NestedDonut has segment labels; Donut doesn\'t', url: '/docs/components/NestedDonut#segment-labels' },
}
