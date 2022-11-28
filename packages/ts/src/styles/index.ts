import { css, injectGlobal } from '@emotion/css'
import { colors, getCSSColorVariable } from './colors'

export const DEFAULT_ICON_FONT_FAMILY = globalThis?.UNOVIS_ICON_FONT_FAMILY || 'FontAwesome'

export const largeSize = css`
  label: large-size;

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
`

export const variables = injectGlobal`
  :root {
    label: vis-root-styles;
    --vis-font-family: Inter, Arial, "Helvetica Neue", Helvetica, sans-serif;
    --vis-color-main: var(${getCSSColorVariable(0)});
    --vis-color-grey: #2a2a2a;
    ${colors.map((c, i) => `${getCSSColorVariable(i)}: ${c};`)}
  }
`


