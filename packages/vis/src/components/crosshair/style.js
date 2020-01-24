// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from 'emotion'

export const global = injectGlobal`
  :root {
    --vis-crosshair-line-stroke: #888;
    --vis-crosshair-circle-stroke: #fff;
  }
`

export const line = css`
  stroke: var(--vis-crosshair-line-stroke);
  stroke-opacity: 1;
  pointer-events: none;
`

export const circle = css`
  stroke: var(--vis-crosshair-circle-stroke);
  stroke-width: 1;
  stroke-opacity: 0.75;
  pointer-events: none;
`
