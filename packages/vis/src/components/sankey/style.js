// Copyright (c) Volterra, Inc. All rights reserved.
import { css } from 'emotion'
import 'styles/component-css-variables/sankey'

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

    &.visible {
      stroke-width: 1;
    }

    &.transparent {
      stroke-width: 10;
      opacity: 0;
    }
  }

  &:hover {
    path {
      stroke: var(--sankey-link-hover-color);
    }
  }
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
