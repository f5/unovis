// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from 'emotion'

export const variables = injectGlobal`
  :root {
    --sankey-link-color: #d0e0ea;
    --sankey-link-opacity: 0.9;
    --sankey-link-hover-color: #76a1ba;
    --vis-color-sankey-node: #2196f3;
    --sankey-node-border-color: rgba(0, 0, 0, 0);
    --sankey-node-border-width: 10px;
    --vis-color-sankey-node-hover: rgba(0, 0, 0, 0.45);
    --sankey-node-border-hover-color: rgba(0, 0 ,0, 0);
    --sankey-node-label-size: 12px;
    --sankey-node-label-color: #000000;
    --sankey-node-icon-size: 22px;
    --vis-color-sankey-icon: #ffffff;
    --sankey-node-icon-font-family: FontAwesome;
  }
`

export const links = css`
  label: links;
`

export const nodes = css`
  label: nodes;
`

export const link = css`
  label: link;

  path {
    fill: none;
    stroke: var(--sankey-link-color);
    stroke-opacity: var(--sankey-link-opacity);
    transition: .1s stroke;
  }

  &:hover {
    path {
      stroke: var(--sankey-link-hover-color);
    }
  }
`

export const visibleLink = css`
  label: visible;

  stroke-width: 1;
`

export const transparentLink = css`
  label: transparent;

  stroke-width: 10;
  opacity: 0;
`

export const node = css`
  label: node;

  rect {
    stroke: var(--sankey-node-border-color);
    stroke-width: var(--sankey-node-border-width);
  }

  &:hover {
    rect {
      stroke: var(--sankey-node-border-hover-color);
    }
  }
`

export const nodeLabel = css`
  label: label;

  font-size: var(--sankey-node-label-size);
  fill: var(--sankey-node-label-color);
  pointer-events: none;
  visibility: hidden;

  &.visible {
    visibility: visible;
  }
`

export const nodeIcon = css`
  label: icon;

  font-family: var(--sankey-node-icon-font-family);
  alignment-baseline: middle;
  text-anchor: middle;
  font-size: var(--sankey-node-icon-size);
  fill: var(--sankey-node-icon-color);
  stroke: var(--sankey-node-color);
  stroke-opacity: 0.6;
`
