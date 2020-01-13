// Copyright (c) Volterra, Inc. All rights reserved.
import { css } from 'emotion'

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
