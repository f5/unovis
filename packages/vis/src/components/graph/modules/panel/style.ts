import { css, injectGlobal } from '@emotion/css'

export const panels = css`
  label: panels;
`

export const variables = injectGlobal`
  :root {
    --vis-graph-panel-border-color: #E6E9F3;
    --vis-graph-panel-border-opacity: 0.9;
    --vis-graph-panel-fill-color: #ffffff;

    --vis-graph-panel-label-color: #6c778c;
    --vis-graph-panel-label-background: #ffffff;
    --vis-graph-panel-label-font-family: var(--vis-font-family);
    --vis-graph-panel-label-font-size: 10pt;
    --vis-graph-panel-label-font-weight: 300;

    --vis-graph-panel-dashed-outline-color: #b7b7b7;

    --vis-graph-panel-side-icon-font-family: var(--vis-icon-font-family);
    --vis-graph-panel-side-icon-symbol-color: #9ea7b8;
    --vis-graph-panel-side-icon-shape-fill-color: #ffffff;

    --vis-dark-graph-panel-border-color: var(--vis-color-gray);
    --vis-dark-graph-panel-fill-color: #292b34;
    --vis-dark-graph-panel-label-color: #E6E9F3;
    --vis-dark-graph-panel-label-background: var(--vis-color-gray);
    --vis-dark-graph-panel-side-icon-symbol-color: #ffffff;
    --vis-dark-graph-panel-side-icon-shape-fill-color: #6c778c;
    --vis-dark-graph-panel-border-color: #a0a6ad;
  }

  body.theme-dark ${`.${panels}`} {
    --vis-graph-panel-border-color: var(--vis-dark-graph-panel-border-color);
    --vis-graph-panel-fill-color: var(--vis-dark-graph-panel-fill-color);
    --vis-graph-panel-label-color: var(--vis-dark-graph-panel-label-color);
    --vis-graph-panel-label-background: var(--vis-dark-graph-panel-label-background);
    --vis-graph-panel-side-icon-symbol-color: var(--vis-dark-graph-panel-side-icon-symbol-color);
    --vis-graph-panel-side-icon-shape-fill-color: var(--vis-dark-graph-panel-side-icon-shape-fill-color);
    --vis-graph-panel-border-color:  var(--vis-dark-graph-panel-border-color);
  }
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
  stroke: var(--vis-graph-panel-dashed-outline-color);
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

export const sideIconGroup = css`
  label: side-icon-group;
`

export const sideIconShape = css`
  label: side-icon-shape;

  fill: var(--vis-graph-panel-side-icon-shape-fill-color);
  stroke-width: 2px;
`

export const customSideIcon = css`
  label: side-icon-custom;
`

export const sideIconSymbol = css`
  label: side-label-icon-text;
  font-family: var(--vis-graph-panel-side-icon-font-family), var(--vis-graph-node-icon-font);
  fill: var(--vis-graph-panel-side-icon-symbol-color);
  stroke: none;
  dominant-baseline: middle;
  text-anchor: middle;
  pointer-events: none;
  cursor: default;
`
