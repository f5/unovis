// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from 'emotion'

export const variables = injectGlobal`
  :root {
    --vis-radial-dendrogram-link-color: #cad5f6;
  }
`

export const node = css`
  label: node;
  stroke-width: 0;
  fill: var(--vis-color-main);
  stroke: var(--vis-color-main);

  &:hover {
    stroke-width: 2;
  }
`

export const gLabel = css`
  label: group-label;
`

export const label = css`
  label: label;
  
  dominant-baseline: middle;
  user-select: none;
`

export const link = css`
  label: link;

  fill: var(--vis-radial-dendrogram-link-color);
  fill-opacity: 0.5;
  transition: .1s fill-opacity;

  &:hover {
    fill-opacity: 1;
  }
`
