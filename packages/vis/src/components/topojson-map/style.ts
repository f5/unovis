// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from 'emotion'

export const variables = injectGlobal`
  :root {
    --vis-map-feature-color: #dce3eb;
    --vis-map-boundary-color: #ffffff;
    
    --vis-map-point-label-text-color-dark: #5b5f6d;
    --vis-map-point-label-text-color-light: #fff;
    --vis-map-point-label-font-family: var(--vis-font-family);
    --vis-map-point-label-font-weight: 600;
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
  
  fill: var(--vis-map-feature-color);
`
export const boundaries = css`
  label: boundaries;
`

export const boundary = css`
  label: boundary;

  fill: none;
  stroke: var(--vis-map-boundary-color);
  stroke-width: .5px;
`

export const background = css`
  label: background;

  fill-opacity: 0;
  pointer-events: all;
`

export const points = css`
  label: points;
`

export const point = css`
  label: point;
`

export const pointCircle = css`
  label: point;

  stroke-opacity: 0.4;
  pointer-events: fill;

  &:active {
    cursor: default;
  }
`

export const pointLabel = css`
  label: label;

  text-anchor: middle;
  cursor: default;
  pointer-events:none;

  font-family: var(--vis-map-point-label-font-family);
  font-weight: var(--vis-map-point-label-font-weight);
  fill: var(--vis-map-point-label-text-color-dark);
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
