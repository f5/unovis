// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from 'emotion'

export const variables = injectGlobal`
  :root {
    --vis-free-brush-selection-fill: #0b1640;
    --vis-free-brush-selection-fill-opacity: 0.4;
    --vis-free-brush-selection-stroke: #acb2b9;
    --vis-free-brush-handle-fill: #6d778c;
    --vis-free-brush-handle-stroke: #eee;
  }
`

export const brush = css`
  label: brush;
  fill: none;
  stroke: none;

  .selection {
    fill: var(--vis-free-brush-selection-fill);
    stroke: var(--vis-free-brush-selection-stroke);
    stroke-width: 0;
    stroke-opacity: 0;
  }

  .handle {
    fill: var(--vis-free-brush-handle-fill);
  }
`

export const hide = css`
  .selection, .handle {
    display: none;
  }
`

export const unselected = css`
  label: unselected;
  fill: var(--vis-free-brush-selection-fill);
  opacity: var(--vis-free-brush-selection-fill-opacity);
  pointer-events: none;
`

export const handleLine = css`
  label: handle-line;
  stroke: var(--vis-free-brush-handle-stroke);
  stroke-width: 1;
  fill: none;
  pointer-events: none;
`
