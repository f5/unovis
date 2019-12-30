// Copyright (c) Volterra, Inc. All rights reserved.

import { css } from 'emotion'

export const axis = css`
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
  fill: var(--vis-color-gray);

  text {
    visibility: hidden;

    &.active {
      visibility: visible;
    }
  }
`

export const label = css`
  label: label;
  fill: var(--vis-color-gray);

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
