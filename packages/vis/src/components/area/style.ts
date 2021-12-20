// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from '@emotion/css'

export const global = injectGlobal`
  :root {
    --vis-area-cursor: default;
    --vis-area-fill: var(--vis-color-main);
    --vis-area-fill-opacity: 1;
    --vis-area-stroke: none;
    --vis-area-stroke-width: 0px;
    --vis-area-stroke-dasharray: none;
    --vis-area-stroke-opacity: 1;
    --vis-area-hover-fill-opacity: var(--vis-area-fill-opacity);
    --vis-area-hover-stroke-width: var(--vis-area-stroke-width);
    --vis-area-hover-stroke: var(--vis-area-stroke);
  }
`

export const area = css`
  label: area;
  cursor: var(--vis-area-cursor);
  fill: var(--vis-area-fill);
  fill-opacity: var(--vis-area-fill-opacity);
  stroke: var(--vis-area-stroke);
  stroke-width: var(--vis-area-stroke-width);
  stroke-dasharray: var(--vis-area-stroke-dasharray);
  stroke-opacity: var(--vis-area-stroke-opacity);

  &:hover {
    fill-opacity: var(--vis-area-hover-fill-opacity);
    stroke-width: var(--vis-area-hover-stroke-width);
    stroke: var(--vis-area-hover-stroke);
  }
`
