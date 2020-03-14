// Copyright (c) Volterra, Inc. All rights reserved.

import { css, injectGlobal } from 'emotion'

export const global = injectGlobal`
  :root {
    --vis-axis-tick-color: #a1a8c0;
    --vis-axis-grid-color: #a1a8c0;
    --vis-axis-label-color: #575c65;
    --vis-axis-tick-label-font-size: 9pt;
    --vis-axis-label-font-size: 12pt;
  }
`

export const axis = css`
  user-select: none;

  .domain {
    stroke: var(--vis-axis-tick-color);
  }

  &.hide-tick-line {
    .tick > line {
      display: none;
    }
  }

  &.hide-domain {
    .domain {
      display: none;
    }
  }
`

export const grid = css`
  label: grid;
  
  .domain {
    display: none;
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
    visibility: hidden;
    fill: var(--vis-axis-tick-color);
    stroke: none;

    &.active {
      visibility: visible;
    }
  }
`

export const label = css`
  label: label;
  fill: var(--vis-axis-label-color);
  font-size: var(--vis-axis-label-font-size);
  text-anchor: middle;

  &.right {
    dominant-baseline: text-before-edge;
  }

  &.left {
    dominant-baseline: text-after-edge;
  }

  &.bottom {
    dominant-baseline: text-before-edge;
  }
`

export const tickText = css`
  label: tick-text;
`

export const fullTickText = css`
  label: full-text;
`
