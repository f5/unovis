// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from 'emotion'

export const variables = injectGlobal`
  :root {
    --map-feature-color: #dce3eb;
    --map-boundry-color: #ffffff;
  }
`

export const map = css`
  label: map;

  &.draggable {
    &:active {
      cursor: grabbing;
      cursor: -moz-grabbing;
      cursor: -webkit-grabbing;
    }
  }
`

export const features = css`
  label: features;
`

export const feature = css`
  label: feature;
  
  fill: var(--map-feature-color);
`
export const boundaries = css`
  label: boundaries;
`

export const boundary = css`
  label: boundary;

  fill: none;
  stroke: var(--map-boundry-color);
  stroke-width: .5px;
`

export const background = css`
  label: background;

  fill-opacity: 0;
  pointer-events: all;
`

export const nodes = css`
  label: nodes;
`

export const node = css`
  label: node;

  stroke-opacity: 0.4;
  pointer-events: fill;

  &:active {
    cursor: default;
  }
`

export const links = css`
  label: links;
`

export const link = css`
  label: link;

  fill: none;
  stroke-opacity: .50;
  stroke-linecap: round;

  &:hover {
    cursor: pointer;
    stroke-opacity: .90;
  }
`
