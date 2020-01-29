// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from 'emotion'

export const global = injectGlobal`
  :root {
    --vis-timeline-row-even: #fff;
    --vis-timeline-row-odd: #f7f9fa;
    --vis-timeline-scrollbar-color: #e7ebf6;
  }
`

export const background = css``

export const line = css`
  label: line;
  fill: none;
  stroke: var(--vis-color-main);
  stroke-linecap: round;
`

export const rect = css`
  label: rect;
  pointer-events: none;
  fill: var(--vis-timeline-row-even);

  &.even {
    fill: var(--vis-timeline-row-odd);
  }
`

export const scrollbar = css`
  label: scroll-bar;
  fill: var(--vis-timeline-scrollbar-color);
`
