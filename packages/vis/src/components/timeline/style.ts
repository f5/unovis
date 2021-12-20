// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from '@emotion/css'

export const global = injectGlobal`
  :root {
    --vis-timeline-row-even-fill: #fff;
    --vis-timeline-row-odd-fill: #f7f9fa;
    --vis-timeline-scrollbar-color: #e7ebf6;

    --vis-timeline-cursor: default;
    --vis-timeline-stroke: var(--vis-color-main);
  }
`

export const background = css``

export const line = css`
  label: line;
  fill: none;
  stroke: var(--vis-timeline-stroke);
  cursor: var(--vis-timeline-cursor);
  stroke-linecap: round;
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
  fill: var(--vis-timeline-scrollbar-color);
`
