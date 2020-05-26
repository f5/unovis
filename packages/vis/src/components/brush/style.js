// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from 'emotion'

export const variables = injectGlobal`
  :root {
    --vis-brush-selection-fill: #262933;
    --vis-brush-selection-stroke: #acb2b9;
    --vis-brush-handle-fill: #a0a7c2;
    --vis-brush-handle-stroke: #dddddd;
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
  opacity: 0.35;
  pointer-events: none;
`

export const handleLine = css`
  label: handle-line;
  stroke: var(--vis-brush-handle-stroke);
  stroke-width: 1.5;
  fill: none;
  pointer-events: none;
`
