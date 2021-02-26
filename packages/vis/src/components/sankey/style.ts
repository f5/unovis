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
    --vis-sankey-node-label-background-stroke-color: #eaeaea;
    --vis-sankey-node-label-text-decoration: none;
    --vis-sankey-node-label-font-weight: 600;
    --vis-sankey-node-sublabel-font-weight: 500;
    --vis-sankey-node-label-cursor: default;

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

export const linkPath = css`
  label: visible;
`

export const linkSelectionHelper = css`
  label: transparent;

  opacity: 0;
`

export const labelGroup = css`
  label: label-group;
`

export const label = css`
  label: label;
  dominant-baseline: hanging;

  fill: var(--vis-sankey-node-label-color);
  text-decoration: var(--vis-sankey-node-label-text-decoration);
  font-weight: var(--vis-sankey-node-label-font-weight);
  cursor: var(--vis-sankey-node-label-cursor);
  user-select: none;

  &, tspan {
    font-family: var(--vis-sankey-label-font-family);
    dominant-baseline: hanging;
  }

`

export const sublabel = css`
  label: sub-label;
  dominant-baseline: hanging;

  fill: var(--vis-sankey-node-label-color);
  pointer-events: none;
  user-select: none;

  &, tspan {
    font-family: var(--vis-sankey-label-font-family);
    font-weight: var(--vis-sankey-node-sublabel-font-weight);
    dominant-baseline: hanging;
  }

`

export const labelBackground = css`
  label: label-background;
  stroke: var(--vis-sankey-node-label-background-stroke-color);
  fill: var(--vis-sankey-node-label-background-fill-color);
  opacity: 0.9;
`

export const hidden = css`
  label: hidden;
  visibility: hidden;
`

export const forceShow = css`
  label: forceShow;
  visibility: visible;
`

export const gNode = css`
  label: g-node;
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
  user-select: none;
`

export const nodeExit = css`
  label: node-exit;
`

export const background = css`
  label: background;
`
