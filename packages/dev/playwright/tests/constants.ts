export const PLOTLINE_EXAMPLE_PATH = '/examples/Plotline/Plot%20Line'
export const XY_LABELS_EXAMPLE_PATH = '/examples/Xy%20Labels/Stacked%20Bar%20with%20Labels'

export const MIGRATED_CONTROL_EXAMPLES: { path: string; button?: string }[] = [
  { path: '/examples/Bullet%20Legend/Bullet%20Shapes' },
  { path: '/examples/Plotband/Plotband' },
  { path: '/examples/Timeline/Timeline%3A%20Empty%20Segments' },
  { path: '/examples/Plotband/Plotband%20Label%20Bleed' },
  { path: '/examples/Plotline/Plotline%20Label%20Bleed' },
  { path: '/examples/Brush/Brush%20%26%20Line%20Chart' },
  { path: '/examples/Xy%20Container/Bleed%20Synchronization' },
  { path: '/examples/Axis/Axis%20with%20Ticks%20Rotation%20Slider' },
  { path: '/examples/Line/Patchy%20Line%20Chart' },
  { path: '/examples/Scatter/Overlapping%20Point%20Culling' },
  { path: '/examples/Scatter/Point%20Label%20Positions' },
  { path: '/examples/Stacked%20Bar/Per-Bar%20Styles', button: '−1 month' },
  { path: '/examples/Grouped%20Bar/Per-Bar%20Styles', button: '−1 month' },
  { path: '/examples/Area/Area%20Min%20Height' },
  { path: '/examples/Area/Line%20Area%20Chart', button: 'Clear data' },
  { path: '/examples/Graph/Graph%3A%20Custom%20Nodes' },
  { path: '/examples/Graph/Parallel%20Layout%20Spacing' },
  { path: '/examples/Graph/Dynamic%20Layout' },
  { path: '/examples/Graph/Graph%3A%20Link%20Flow%20Speed' },
  { path: '/examples/Graph/Link%20Arrows', button: 'Hide Legend' },
  { path: '/examples/Chord%20Diagram/Chord%20Diagram%20Node%20Selection' },
  { path: '/examples/Chord%20Diagram/Labels%20and%20Radius%20Scale%20Exponent' },
  { path: '/examples/Sankey/Sankey%20with%20Zoom', button: 'Toggle Mode' },
  { path: '/examples/Sankey/Basic%20Sankey' },
  { path: '/examples/Treemap/Treemap%3A%20Search' },
  { path: '/examples/Treemap/Treemap%3A%20Tiling%20Methods' },
  { path: '/examples/Circular%20Bar/Circular%20Bar%20Playground' },
  { path: '/examples/Nested%20Donut/Segment%20labels', button: 'Hide Labels' },
  { path: '/examples/Nested%20Donut/Segment%20values' },
  { path: '/examples/Topojson/MapFitToPoints' },
  { path: '/examples/Leaflet/Vector%20Map', button: 'Hide Map' },
  { path: '/examples/Leaflet/Light%20and%20Dark%20Theme', button: 'Toggle documentElement' },
]

export const LEAFLET_CONTROL_TILE_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg=='

export const LEAFLET_VECTOR_TEST_STYLE = {
  version: 8,
  glyphs: 'http://localhost:9501/capture-fonts/{fontstack}/{range}.pbf',
  sources: { capture: { type: 'geojson', data: 'http://localhost:9501/capture-map.geojson' } },
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#e6edf5' } },
    { id: 'land', source: 'capture', type: 'fill', paint: { 'fill-color': '#96c8a2' } },
  ],
}

export const LEAFLET_VECTOR_TEST_DATA = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [[[-130, 20], [-60, 20], [-60, 60], [-130, 60], [-130, 20]]] },
  }],
}
