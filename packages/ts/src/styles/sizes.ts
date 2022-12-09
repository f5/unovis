import { css } from '@emotion/css'

export const styleLargeSize = css`
  label: large-size;

  /* Axis */
  --vis-axis-label-font-size: 18px;
  --vis-axis-tick-label-font-size: 16px;

  /* Donut */
  --vis-donut-central-label-font-size: 20px;
  --vis-donut-central-sub-label-font-size: 16px;

  /* Graph */
  --vis-graph-node-bottom-icon-font-size: 18pt;
  --vis-graph-node-label-font-size: 12pt;
  --vis-graph-node-sublabel-font-size: 10pt;
  --vis-graph-panel-label-font-size: 14pt;

  /* LeafletMap */
  --vis-map-point-bottom-label-font-size: 14px;

  /* Legend */
  --vis-legend-label-font-size: 16px;
  --vis-legend-bullet-label-spacing: 10px;
  --vis-legend-bullet-size: 12px;

  /* Sankey */
  --vis-sankey-node-label-font-size: 16px;
  --vis-sankey-node-sublabel-font-size: 14px;
  --vis-sankey-icon-size: 28px;

  /* Scatter */
  --vis-scatter-point-label-text-font-size: 16px;

  /* Timeline */
  --vis-timeline-label-font-size: 18px;

  /* TopoJSONMap */
  --vis-map-point-label-font-size: 16px;

  /* XYLabels */
  --vis-xy-label-font-size: 16px;
  --vis-xy-label-cluster-font-size: 18px;

  /* Override leaflet.css */
  .leaflet-touch .leaflet-control-zoom-in, .leaflet-touch .leaflet-control-zoom-out  {
    font-size: 28px;
  }
  .leaflet-control-attribution a {
    font-size: 10pt;
  }
  .leaflet-container .leaflet-control-attribution,
  .leaflet-container .leaflet-control-scale,
  .leaflet-control-scale-line {
    font-size: 14px;
  }
  `

export const styleExtraLargeSize = css`
  label: extra-large-size;

  /* Axis */
  --vis-axis-label-font-size: 28px;
  --vis-axis-tick-label-font-size: 24px;

  /* Donut */
  --vis-donut-central-label-font-size: 32px;
  --vis-donut-central-sub-label-font-size: 24px;

  /* Graph */
  --vis-graph-node-bottom-icon-font-size: 28pt;
  --vis-graph-node-label-font-size: 18pt;
  --vis-graph-node-sublabel-font-size: 16pt;
  --vis-graph-panel-label-font-size: 20pt;

  /* LeafletMap */
  --vis-map-point-bottom-label-font-size: 20px;

  /* Legend */
  --vis-legend-label-font-size: 24px;
  --vis-legend-bullet-label-spacing: 16px;
  --vis-legend-bullet-size: 18px;

  /* Sankey */
  --vis-sankey-node-label-font-size: 24px;
  --vis-sankey-node-sublabel-font-size: 20px;
  --vis-sankey-icon-size: 44px;

  /* Scatter */
  --vis-scatter-point-label-text-font-size: 24px;

  /* Timeline */
  --vis-timeline-label-font-size: 28px;

  /* TopoJSONMap */
  --vis-map-point-label-font-size: 24px;

  /* XYLabels */
  --vis-xy-label-font-size: 24px;
  --vis-xy-label-cluster-font-size: 28px;

  /* Override leaflet.css */
  .leaflet-touch .leaflet-control-zoom-in, .leaflet-touch .leaflet-control-zoom-out  {
    font-size: 44px;
  }
  .leaflet-control-attribution a {
    font-size: 14pt;
  }
  .leaflet-container .leaflet-control-attribution,
  .leaflet-container .leaflet-control-scale,
  .leaflet-control-scale-line {
    font-size: 22px;
  }
`
