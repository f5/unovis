// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from '@emotion/css'

export const global = injectGlobal`
  :root {
    --vis-stacked-bar-cursor: default;
    --vis-stacked-bar-fill: var(--vis-color-main);
    --vis-stacked-bar-stroke: none;
    --vis-stacked-bar-stroke-width: 0px;
    --vis-stacked-bar-hover-stroke-width: 1px;
    --vis-stacked-bar-hover-stroke: none;
  }
`

export const root = css`
  label: stacked-bar-component;
`

export const bar = css`
  label: bar;
  fill: var(--vis-stacked-bar-fill);
  stroke: var(--vis-stacked-bar-stroke);
  stroke-width: var(--vis-stacked-bar-stroke-width);
  cursor: var(--vis-stacked-bar-cursor);

  &:hover {
    stroke-width: var(--vis-stacked-bar-hover-stroke-width);
    stroke: var(--vis-stacked-bar-hover-stroke);
  }
`

export const barGroup = css`
  label: barGroup;
`

export const barGroupExit = css`
  label: barGroupExit;
`
