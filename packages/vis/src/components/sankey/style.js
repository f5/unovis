// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from 'emotion'

export const variables = injectGlobal`
  :root {
    --vis-sankey-link-cursor: default;
    --vis-sankey-link-color: #cad5f6;

    --vis-sankey-node-cursor: default;
    --vis-sankey-node-fill: #4e4dd1;
    --vis-sankey-node-label-color: #575c65;

    --vis-sankey-icon-size: 22px;
    --vis-sankey-icon-color: #ffffff;
    --vis-sankey-icon-font-family: FontAwesome;

    --vis-sankey-label-font-family: var(--vis-font-family);
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
    cursor: var(--vis-sankey-link-cursor);
    stroke: var(--vis-sankey-link-color);
    stroke-opacity: 0.5;
    transition: .1s stroke;
  }

  &:hover {
    path {
      stroke-opacity: 1;
    }
  }
`

export const visibleLink = css`
  label: visible;
`

export const transparentLink = css`
  label: transparent;

  stroke-width: 10;
  opacity: 0;
`

export const node = css`
  label: node;

  rect {
    cursor: var(--vis-sankey-node-cursor);
    fill: var(--vis-sankey-node-fill);
    opacity: 0.9;
  }
  
  &:hover {
    rect {
      opacity: 1;
    }
  }
`

export const nodeLabel = css`
  label: label;

  fill: var(--vis-sankey-node-label-color);
  pointer-events: none;
  visibility: hidden;
  user-select: none;

  &, tspan {
    font-family: var(--vis-sankey-label-font-family);
  }

  &.visible {
    visibility: visible;
  }
`

export const nodeIcon = css`
  label: icon;

  font-family: var(--vis-sankey-icon-font-family);
  text-anchor: middle;
  font-size: var(--vis-sankey-icon-size);
  fill: var(--vis-sankey-node-icon-color);
  stroke: var(--vis-sankey-node-fill);
  stroke-opacity: 0.6;
`
