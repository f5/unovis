// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from '@emotion/css'

export const variables = injectGlobal`
  :root {
    --vis-brush-selection-fill: #0b1640;
    --vis-brush-selection-stroke: #acb2b9;
    --vis-brush-handle-fill: #6d778c;
    --vis-brush-handle-stroke: #eee;
  }
`

export const brush = css`
  label: brush;
  fill: none;
  stroke: none;

  .selection {
    fill: none;
    stroke: var(--vis-brush-selection-stroke);
    stroke-width: 0;
    stroke-opacity: 0;
  }

  .handle {
    fill: var(--vis-brush-handle-fill);
  }

  &.non-draggable {
    .selection, .overlay {
      pointer-events: none;
    }
  }
`

export const unselected = css`
  label: unselected;
  fill: var(--vis-brush-selection-fill);
  opacity: 0.4;
  pointer-events: none;
`

export const handleLine = css`
  label: handle-line;
  stroke: var(--vis-brush-handle-stroke);
  stroke-width: 1;
  fill: none;
  pointer-events: none;
`
