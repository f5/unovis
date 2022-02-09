// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from '@emotion/css'

export const global = injectGlobal`
  :root {
    --vis-timeline-row-even-fill: #fff;
    --vis-timeline-row-odd-fill: #f7f9fa;
    --vis-timeline-scrollbar-background-color: #E6E9F3;
    --vis-timeline-scrollbar-color: #9EA7B8;

    --vis-timeline-label-font-size: 12px;
    --vis-timeline-label-color: #6C778C;

    --vis-timeline-cursor: default;
    --vis-timeline-stroke: var(--vis-color-main);
  }
`

export const background = css`
  label: background;
`

export const lines = css`
  label: lines;
`

export const line = css`
  label: line;
  fill: none;
  stroke: var(--vis-timeline-stroke);
  cursor: var(--vis-timeline-cursor);
  stroke-linecap: round;
`

export const rows = css`
  label: rows;
`

export const rect = css`
  label: rect;
  pointer-events: none;
  fill: var(--vis-timeline-row-even-fill);

  &.even {
    fill: var(--vis-timeline-row-odd-fill);
  }
`

export const scrollbar = css`
  label: scroll-bar;
`

export const scrollbarHandle = css`
  label: scroll-bar-handle;
  fill: var(--vis-timeline-scrollbar-color);
`

export const scrollbarBackground = css`
  label: scroll-bar-background;
  fill: var(--vis-timeline-scrollbar-background-color);
`

export const labels = css`
  label: labels;
`

export const label = css`
  label: label;
  dominant-baseline: middle;
  font-size: var(--vis-timeline-label-font-size);
  fill: var(--vis-timeline-label-color);
  text-anchor: end;
`
