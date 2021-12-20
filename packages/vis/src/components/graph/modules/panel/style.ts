// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from '@emotion/css'

export const variables = injectGlobal`
  :root {
    --vis-graph-panel-border-color: #E6E9F3;
    --vis-graph-panel-border-opacity: 0.9;
    --vis-graph-panel-fill-color: #ffffff;
    --vis-graph-panel-label-color: #6c778c;
    --vis-graph-panel-label-background: #ffffff;
    --vis-graph-panel-label-font-family: var(--vis-font-family);
    --vis-graph-panel-side-label-fill: #ffffff;
    --vis-graph-panel-selection-outline-color: #b7b7b7;
    --vis-graph-panel-label-font-size: 10pt;
    --vis-graph-panel-label-font-weight: 300;
  }
`

export const panels = css`
  label: panels;
`

export const gPanel = css`
  label: g-panel;
`

export const panel = css`
  label: panel;

  stroke: var(--vis-graph-panel-border-color);
  stroke-opacity: var(--vis-graph-panel-border-opacity);
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
  font-size: var(--vis-graph-panel-label-font-size);
  font-weight: var(--vis-graph-panel-label-font-weight);;
  cursor: default;
  stroke: none;
  font-family: var(--vis-graph-panel-label-font-family);
`

export const panelSelectionActive = css`
  label: active;
`

export const panelSelection = css`
  label: panel-selection-outline;

  opacity: 0;
  stroke-width: 1;
  stroke-dasharray: 3 3;
  fill: var(--vis-graph-node-selection-color);
  fill-opacity: 0.1;
  stroke: var(--vis-graph-panel-selection-outline-color);
  stroke-opacity: 0;

  &${`.${panelSelectionActive}`} {
    opacity: 1;
    stroke-opacity: 0.75;
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
  font-family: var(--vis-graph-node-icon-font), var(--vis-graph-panel-label-font-family);
  fill: var(--vis-graph-node-icon-color);
  stroke: none;
  dominant-baseline: middle;
  text-anchor: middle;
  pointer-events: none;
  cursor: default;
`
