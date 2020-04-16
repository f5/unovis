// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from 'emotion'

export const variables = injectGlobal`
  :root {
    --vis-graph-panel-border-color: #959595;
    --vis-graph-panel-fill-color: #ffffff;
    --vis-graph-panel-label-color: #7d8892;
    --vis-graph-panel-label-background: #ffffff;
    --vis-graph-panel-side-label-fill: #ffffff;
  }
`

export const panels = css`
  label: panels;
`

export const gPanel = css`
  label: g-panel;

  transition: .25s opacity;
  opacity: 1;
`

export const panel = css`
  label: panel;

  stroke: var(--vis-graph-panel-border-color);
  stroke-opacity: 0.9;
  fill: var(--vis-graph-panel-fill-color);
`

export const label = css`
  label: label;
  
  fill: var(--vis-graph-panel-label-color);
`

export const background = css`
  label: background;

  opacity: 0.9;
  -webkit-backdrop-filter: blur(2px);
  backdrop-filter: blur(2px);
  fill: var(--vis-graph-panel-label-background);
  stroke: none;
`

export const labelText = css`
  label: label-text;

  text-anchor: middle;
  font-size: 10pt;
  font-weight: 300;
  stroke: none;
`

export const panelSelectionActive = css`
  label: active;
`

export const panelSelection = css`
  label: panel-selection-outline;

  display: none;
  stroke-width: 1;
  stroke-dasharray: 3 3;
  fill: var(--vis-graph-node-selection-color);
  fill-opacity: 0.1;
  stroke: var(--vis-graph-node-stroke-color);
  stroke-opacity: 0.75;

  &${`.${panelSelectionActive}`} {
    display: inline;
  }
`

export const greyout = css`
  label: greyout;

  opacity: 0.4;
`

export const sideLabelGroup = css`
  label: side-label-group;
`

export const sideLabel = css`
  label: side-label;

  fill: var(--vis-graph-panel-side-label-fill);
  stroke-width: 2px;
`

export const customSideLabel = css`
  label: side-label-custom;
`

export const sideLabelIcon = css`
  label: side-label-icon-text;

  stroke: none;
  dominant-baseline: middle;
  text-anchor: middle;
  pointer-events: none;
  font-size: 10pt;
`
