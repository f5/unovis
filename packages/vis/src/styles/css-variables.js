// Copyright (c) Volterra, Inc. All rights reserved.
import { injectGlobal } from 'emotion'
import { colors, getCSSVarName } from './colors'

export const variables = injectGlobal`
  :root {
    label: vis-root-styles;
    --vis-font: Open Sans, Arial, Helvetica Neue, Helvetica, sans-serif;
    --vis-color-main: #34daa6;
    --vis-color-gray: #2a2a2a;
    ${colors.map((c, i) => `${getCSSVarName(i)}: ${c};`)}

    --vis-brush-selection-fill: #262933;
    --vis-brush-selection-stroke: #acb2b9;
    --vis-brush-handle-fill: #a0a7c2;
    --vis-brush-handle-stroke: #dddddd;

    --vis-legend-label-color: #333;
    --vis-legend-bullet-inactive-color: #eee;
    --highlight-filter-id: url(#saturate);
  }
`
