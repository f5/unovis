// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from 'emotion'

export const global = injectGlobal`
  :root {
    --vis-scatter-cursor: default;
    --vis-scatter-fill: var(--vis-color-main);
    --vis-scatter-stroke: none;
    --vis-scatter-stroke-width: 0px;
    --vis-scatter-hover-stroke-width: 2px;
    --vis-scatter-hover-stroke: none;
  }
`

export const point = css`
  label: point;

  > path, text {
    cursor: var(--vis-scatter-cursor);
    stroke-width: var(--vis-scatter-stroke-width);
    stroke: var(--vis-scatter-stroke);
    fill: var(--vis-scatter-fill);
    user-select: none;

    &:hover {
      stroke-width: var(--vis-scatter-hover-stroke-width);
      stroke: var(--vis-scatter-hover-stroke);
    }
  }
`
