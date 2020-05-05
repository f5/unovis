// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from 'emotion'

export const variables = injectGlobal`
  :root {
    /* Node Fill */
    --vis-graph-node-stroke-color: rgba(255,255,255,0.25);
    --vis-graph-node-fill-color: #ced3de;
    --vis-graph-node-stroke-segment-color: #adb4c2;
    --vis-graph-node-selection-color: #acb3b8;

    /* Node Central Icon */
    --vis-graph-node-icon-color: #a0a6ad;
    --vis-graph-node-icon-font: FontAwesome;
    --vis-graph-node-icon-fill-color-bright: #ffffff;
    --vis-graph-node-icon-fill-color-dark: #a5abb2;

    /* Node Label */
    --vis-graph-node-label-background: #ffffff;
    --vis-graph-node-label-text-color: #5b5f6d;
    --vis-graph-node-sublabel-text-color: #989aa3;

    /* Node Side Labels (circular labels)*/
    --vis-graph-node-side-label-background-fill-color: #a0a9af;
    --vis-graph-node-side-label-background-stroke-color: #ffffff;
    --vis-graph-node-side-label-fill-color-bright: #ffffff;
    --vis-graph-node-side-label-fill-color-dark: #494b56;

    /* Greyout */
    --vis-graph-node-greyout-color: #ebeff7;
    --vis-graph-node-icon-greyout-color: #c6cad1;
    --vis-graph-node-side-label-background-greyout-color: #f1f4f7;
  }
`

export const nodes = css`
  label: nodes;
`

export const node = css`
  label: node;

  stroke: var(--vis-graph-node-stroke-color);
  fill: var(--vis-graph-node-fill-color);
  transition: .4s fill, .4s stroke;
`

export const nodeIcon = css`
  label: icon;

  font-family: var(--vis-graph-node-icon-font), Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif;
  dominant-baseline: middle;
  text-anchor: middle;
  pointer-events: none;
  transition: .4s all;
  fill: var(--vis-graph-node-icon-color);
`

export const nodeIsDragged = css`
  label: dragged;
`

export const label = css`
  label: label;

  text-anchor: middle;
  font-weight: 300;
  font-size: 9pt;
`

export const labelBackground = css`
  label: background;

  opacity: 0.9;
  -webkit-backdrop-filter: blur(2px);
  backdrop-filter: blur(2px);
  fill: var(--vis-graph-node-label-background);
`

export const labelText = css`
  label: label-text;
`

export const labelTextContent = css`
  label: label-text-content;

  fill: var(--vis-graph-node-label-text-color);
`

export const subLabelTextContent = css`
  label: sublabel-text-content;

  fill: var(--vis-graph-node-sublabel-text-color);
  font-size: 8pt;
`

export const sideLabelsGroup = css`
  label: side-labels-group;
`

export const sideLabelBackground = css`
  label: side-label-background;

  stroke-opacity: 0.8;
  stroke: var(--vis-graph-node-side-label-background-stroke-color);
  fill: var(--vis-graph-node-side-label-background-fill-color);
`

export const sideLabel = css`
  label: side-label;

  font-family: Open Sans, Helvetica Neue, Helvetica, var(--vis-graph-node-icon-font);
  alignment-baseline: middle;
  text-anchor: middle;
  font-size: 16px;
  fill: var(--vis-graph-node-side-label-fill-color-bright);
`

export const sideLabelGroup = css`
  label: side-label-group; 
`

export const gNode = css`
  label: g-node;

  transition: .25s opacity;

  &:hover {
    cursor: grab;
  }

  &${`.${nodeIsDragged}`} {
    cursor: grabbing;
  }

`

export const gNodeExit = css`
  label: g-node-exit;
  pointer-events: none;
`

export const nodeSelectionActive = css`
  label: active;
`

export const nodeSelection = css`
  label: node-selection;

  fill: none;
  stroke-width: 1;
  stroke-dasharray: 3 3;
  opacity: 0;
  transition: 350ms cubic-bezier(0.165, 0.840, 0.440, 1.000);
  transform: scale(.5);
  fill: var(--vis-graph-node-selection-color);
  fill-opacity: 0.1;
  stroke: var(--vis-graph-node-stroke-color);
  stroke-opacity: 0.75;

  &${`.${nodeSelectionActive}`} {
    opacity: 1;
    transform: scale(1);
  }
`

export const nodeArc = css`
  label: node-arc;

  fill: var(--vis-graph-node-stroke-segment-color);
  transition: .4s fill;
`

export const nodePolygon = css`
  label: polygon;

  ${`.${nodeArc}`} {
    fill-opacity: 0;
    stroke-linecap: round;
    pointer-events: none;
  }
`

export const customNode = css`
  label: custom-node;

  stroke-width: 0;
`

export const greyoutNode = css`
  label: greyout;
  
  ${`.${node}`} {
    fill: var(--vis-graph-node-greyout-color) !important;
    stroke: var(--vis-graph-node-greyout-color) !important;
  }

  ${`.${nodeIcon}`} {
     fill: var(--vis-graph-node-icon-greyout-color) !important;
  }

  ${`.${nodeArc}`} {
    fill: var(--vis-graph-node-greyout-color) !important;
    stroke: var(--vis-graph-node-greyout-color) !important;
  }

  ${`.${label}`} {
    opacity: 0.5;
  }

  ${`.${sideLabelBackground}`} {
     fill: var(--vis-graph-node-side-label-background-greyout-color) !important;
     stroke-opacity: 0.5;
   }

   ${`.${sideLabel}`} {
    fill: var(--vis-graph-node-side-label-fill-color-bright) !important;
    opacity: 0.25;
  }
  /* filter: url("#desaturate"); */
`
