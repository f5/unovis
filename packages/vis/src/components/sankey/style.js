// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from 'emotion'

export const SANKEY_ICON_SIZE = 22

export const variables = injectGlobal`
  :root {
    --vis-sankey-link-cursor: default;
    --vis-sankey-link-color: #cad5f6;

    --vis-sankey-node-cursor: default;
    --vis-sankey-node-fill: #4e4dd1;
    --vis-sankey-node-label-color: #575c65;

    --vis-sankey-node-label-background-fill-color: #ffffff;
    --vis-sankey-node-label-background-stroke-color: #dadada;

    --vis-sankey-icon-size: ${SANKEY_ICON_SIZE}px;
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
    fill: var(--vis-sankey-link-color);
    fill-opacity: 0.5;
    transition: .1s stroke;
  }

  &:hover {
    path {
      fill-opacity: 1;
    }
  }
`

export const visibleLink = css`
  label: visible;
`

export const transparentLink = css`
  label: transparent;

  opacity: 0;
`

export const labelGroup = css`
  label: label-group;
  visibility: hidden;
`

export const nodeLabel = css`
  label: label;

  fill: var(--vis-sankey-node-label-color);
  font-weight: 600;
  pointer-events: none;
  user-select: none;

  &, tspan {
    font-family: var(--vis-sankey-label-font-family);
  }

`

export const nodeSubLabel = css`
  label: sub-label;

  fill: var(--vis-sankey-node-label-color);
  pointer-events: none;
  user-select: none;

  &, tspan {
    font-family: var(--vis-sankey-label-font-family);
  }

`

export const labelBackground = css`
  label: label-background;
  stroke: var(--vis-sankey-node-label-background-stroke-color);
  fill: var(--vis-sankey-node-label-background-fill-color);
  opacity: 0.8;
`

export const visibleLabel = css`
  label: visible-label;
  visibility: visible;
`

export const gNode = css`
  label: g-node;

  &${`.${visibleLabel}`} {
    ${`.${nodeLabel}`} {
      visibility: visible;
    }
    ${`.${nodeSubLabel}`} {
      visibility: visible;
    }
    ${`.${labelBackground}`} {
      visibility: visible;
    }
  }
`

export const node = css`
  label: node;

  cursor: var(--vis-sankey-node-cursor);
  fill: var(--vis-sankey-node-fill);
  opacity: 0.9;

  &:hover {
    opacity: 1;
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

export const nodeExit = css`
  label: node-exit;
`
