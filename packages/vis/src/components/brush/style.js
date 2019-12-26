// Copyright (c) Volterra, Inc. All rights reserved.
import { css } from 'emotion'

export const brush = css`
  label: brush;
  fill: none;
  stroke: none;
  
  .selection {
    fill: none;
    stroke: #acb2b9;
    stroke-width: 1;
    stroke-opacity: 1;
  }
  
  .handle {
    fill: #acb2b9;
  }
`

export const unselected = css`
  label: unselected;
  fill: #262933;
  opacity: 0.35;
  pointer-events: none;
`

export const handleLine = css`
  label: handle-line;
  stroke: #dddddd;
  stroke-width: 1.5;
  fill: none;
  pointer-events: none;
`
