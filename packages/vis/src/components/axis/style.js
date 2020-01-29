// Copyright (c) Volterra, Inc. All rights reserved.

import { css, injectGlobal } from 'emotion'

export const global = injectGlobal`
  :root {
    --vis-axis-tick-color: #767d89;
    --vis-axis-label-color: #575c65;
  }
`

export const axis = css`
  user-select: none;

  .domain {
    stroke: var(--vis-axis-tick-color);
  }

  &.hide-grid-line {
    .domain {
      display: none;
    }
  }

  &.hide-tick-line {
    .tick > line {
      display: none;
    }
  }
`

export const tick = css`
  label: tick;
  stroke: none;
  font-size: 11px;

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
  text-anchor: middle;

  &.right {
    dominant-baseline: text-after-edge;
  }

  &.left, &.bottom {
    dominant-baseline: text-before-edge;
  }
`

export const tickText = css`
  label: tick-text;
`

export const fullTickText = css`
  label: full-text;
`
