// Copyright (c) Volterra, Inc. All rights reserved.

import { css, injectGlobal } from 'emotion'

export const global = injectGlobal`
  :root {
    --vis-axis-tick-color: #a1a8c0;
    --vis-axis-grid-color: #a1a8c0;
    --vis-axis-label-color: #6c778c;
    --vis-axis-tick-label-font-size: 12px;
    --vis-axis-label-font-size: 14px;
  }
`

export const hideTickLine = css`
  label: hide-tick-line;
`

export const hideDomain = css`
  label: hide-domain;
`

export const axis = css`
  label: axis;

  user-select: none;

  .domain {
    stroke: var(--vis-axis-tick-color);
  }

  &${`.${hideTickLine}`} {
    .tick > line {
      opacity: 0;
    }
  }

  &${`.${hideDomain}`} {
    .domain {
      opacity: 0;
    }
  }
`

export const grid = css`
  label: grid;
  
  .domain {
    opacity: 0;
  }

  line {
    stroke: var(--vis-axis-grid-color);
    stroke-opacity: 0.25;
  }
`

export const tick = css`
  label: tick;

  stroke: none;
  font-size: var(--vis-axis-tick-label-font-size);

  line {
    stroke: var(--vis-axis-tick-color);
  }

  text {
    fill: var(--vis-axis-tick-color);
    stroke: none;
  }
`

export const label = css`
  label: label;
  fill: var(--vis-axis-label-color);
  font-size: var(--vis-axis-label-font-size);
  text-anchor: middle;
`

export const tickText = css`
  label: tick-text;
`
