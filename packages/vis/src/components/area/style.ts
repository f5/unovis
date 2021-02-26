// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from 'emotion'

export const global = injectGlobal`
  :root {
    --vis-area-cursor: default;
    --vis-area-fill: var(--vis-color-main);
    --vis-area-stroke: none;
    --vis-area-stroke-width: 0px;
    --vis-area-hover-stroke-width: 1px;
    --vis-area-hover-stroke: none;
  }
`

export const area = css`
  label: area;
  cursor: var(--vis-area-cursor);
  fill: var(--vis-area-fill);
  stroke: var(--vis-area-stroke);
  stroke-width: var(--vis-area-stroke-width);

  &:hover {
    stroke-width: var(--vis-area-hover-stroke-width);
    stroke: var(--vis-area-hover-stroke);
  }
`
