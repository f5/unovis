// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from '@emotion/css'

export const root = css`
  label: brush-component;
`

export const variables = injectGlobal`
  :root {
    --vis-brush-selection-fill: #0b1640;
    --vis-brush-selection-stroke: #acb2b9;
    --vis-brush-handle-fill: #6d778c;
    --vis-brush-handle-stroke: #eee;

    --vis-dark-brush-selection-fill:#acb2b9;
    --vis-dark-brush-selection-stroke: #0b1640; 
    --vis-dark-brush-handle-fill: #acb2b9;
    --vis-dark-brush-handle-stroke: var(--vis-color-gray);
  }

  body.theme-dark .${root}{selection);
    --vis-brush-selection-fill: var(--vis-dark-brush-selection-fill);
    --vis-brush-selection-stroke: var(--vis-dark-brush-selection-stroke); 
    --vis-brush-handle-fill: var(--vis-dark-brush-handle-fill);
    --vis-brush-handle-stroke: var(--vis-dark-brush-handle-stroke);
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
