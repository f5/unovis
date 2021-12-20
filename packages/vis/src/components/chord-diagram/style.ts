// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from '@emotion/css'

export const variables = injectGlobal`
  :root {
    --vis-radial-dendrogram-link-fill-color: #cad5f6;
    --vis-radial-dendrogram-link-stroke-color: #777777;
    --vis-radial-dendrogram-link-stroke-opacity: 0.15;

    /* */
    --vis-chord-diagram-label-text-fill-color-bright: #ffffff;
    --vis-chord-diagram-label-text-fill-color-dark: #a5abb2;
  }
`

export const nodes = css`
  label: nodes;
`

export const links = css`
  label: links;
`

export const labels = css`
  label: labels;
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

export const hoveredNode = css`
  label: hovered;
  fill-opacity: 1;
  stroke-width: 1.5;
`

export const gLabel = css`
  label: group-label;
`

export const label = css`
  label: label;

  dominant-baseline: middle;
  user-select: none;
  pointer-events: none;

  > textPath {
    dominant-baseline: middle;
  }
`

export const labelExit = css`
  label: label-exit;
`

export const link = css`
  label: link;

  fill: var(--vis-radial-dendrogram-link-fill-color);
  stroke:  var(--vis-radial-dendrogram-link-stroke-color);
  stroke-opacity:  var(--vis-radial-dendrogram-link-stroke-opacity);
  transition: .1s fill-opacity;

  &:hover {
    fill-opacity: 1;
  }
`

export const hoveredLink = css`
  label: hovered;
  fill-opacity: 0.9;
`

export const transparent = css`
  fill-opacity: 0.25;

  text {
    fill-opacity: 1;
  }
`
